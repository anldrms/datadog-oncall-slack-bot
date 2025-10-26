require('dotenv').config();
const { WebClient } = require('@slack/web-api');
const axios = require('axios');
const cron = require('node-cron');

// Configuration
const config = {
  datadog: {
    apiKey: process.env.DATADOG_API_KEY,
    appKey: process.env.DATADOG_APP_KEY,
    site: process.env.DATADOG_SITE || 'datadoghq.eu',
    scheduleId: process.env.DATADOG_SCHEDULE_ID
  },
  slack: {
    token: process.env.SLACK_BOT_TOKEN,
    channelId: process.env.SLACK_CHANNEL_ID
  },
  cronSchedule: process.env.CRON_SCHEDULE || '0 9 * * *',
  pinMessage: process.env.PIN_MESSAGE === 'true',
  // Multi-channel configuration
  channels: [
    {
      id: process.env.SLACK_CHANNEL_1_ID,
      scheduleId: process.env.SLACK_CHANNEL_1_SCHEDULE_ID,
      cronSchedule: '0 9 * * *', // Every day at 9 AM EST
      name: 'c1-oncall-bot',
      mode: 'general-all-teams' // Uses post-general-oncall.js for ALL teams
    },
    {
      id: process.env.SLACK_CHANNEL_2_ID,
      scheduleId: process.env.SLACK_CHANNEL_2_SCHEDULE_ID,
      cronSchedule: '0 8 * * 1', // Every Monday at 8 AM EST
      name: 'system-production',
      mode: 'topic-only' // Only update topic with Infrastructure on-call
    }
  ].filter(c => c.id) // Only include channels that are configured
};

// Initialize Slack client
const slackClient = new WebClient(config.slack.token);

/**
 * Fetch current on-call information from Datadog
 */
async function getOnCallInfo() {
  try {
    const url = `https://api.${config.datadog.site}/api/v2/on-call/oncalls`;

    const response = await axios.get(url, {
      headers: {
        'DD-API-KEY': config.datadog.apiKey,
        'DD-APPLICATION-KEY': config.datadog.appKey,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching on-call data from Datadog:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get specific schedule on-call information
 */
async function getScheduleOnCall(scheduleId) {
  try {
    const url = `https://api.${config.datadog.site}/api/v2/on-call/schedules/${scheduleId}/on-call`;

    const response = await axios.get(url, {
      headers: {
        'DD-API-KEY': config.datadog.apiKey,
        'DD-APPLICATION-KEY': config.datadog.appKey,
        'Content-Type': 'application/json'
      },
      params: {
        include: 'user'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching schedule on-call:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Format on-call information for Slack message
 */
function formatOnCallMessage(onCallData, scheduleName = null) {
  if (!onCallData || !onCallData.data) {
    return {
      text: '🚨 On-Call Status',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 On-Call Status'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '_No on-call schedule found or no one is currently on-call._'
          }
        }
      ]
    };
  }

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🔧 Carlton One - System Production On-Call'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Current On-Call Engineer for System Production Team*'
      }
    },
    {
      type: 'divider'
    }
  ];

  const oncallData = onCallData.data;
  const attributes = oncallData.attributes || {};

  // Find user from included resources
  let user = null;
  if (onCallData.included && onCallData.included.length > 0) {
    user = onCallData.included.find(item => item.type === 'users');
  }

  const start = attributes.start ? new Date(attributes.start) : null;
  const end = attributes.end ? new Date(attributes.end) : null;

  const userName = user?.attributes?.name || user?.attributes?.email || 'Unknown User';
  const userEmail = user?.attributes?.email || '';

  let timeRange = '';
  if (start && end) {
    timeRange = `\n⏰ *Shift:* ${start.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Toronto'
    })} - ${end.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Toronto'
    })} EST`;
  }

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*📋 Schedule:* ${scheduleName || 'System Production'}\n👤 *On-Call Engineer:* ${userName}${userEmail ? `\n📧 *Email:* ${userEmail}` : ''}${timeRange}`
    }
  });

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `_🏢 Carlton One - System Production Team | Updated: ${new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' })} EST_`
      }
    ]
  });

  return {
    text: '🔧 Carlton One - System Production On-Call',
    blocks: blocks
  };
}

/**
 * Update Slack channel topic with on-call information
 */
async function updateChannelTopic(onCallData, scheduleName) {
  return updateChannelTopicForChannel(onCallData, scheduleName, config.slack.channelId);
}

/**
 * Update Slack channel topic for a specific channel
 */
async function updateChannelTopicForChannel(onCallData, scheduleName, channelId) {
  try {
    if (!onCallData || !onCallData.data) {
      return;
    }

    const oncallData = onCallData.data;
    const attributes = oncallData.attributes || {};

    // Find user from included resources
    let user = null;
    if (onCallData.included && onCallData.included.length > 0) {
      user = onCallData.included.find(item => item.type === 'users');
    }

    const userName = user?.attributes?.name || user?.attributes?.email || 'Unknown User';
    const start = attributes.start ? new Date(attributes.start) : null;
    const end = attributes.end ? new Date(attributes.end) : null;

    let shiftInfo = '';
    if (start && end) {
      const startStr = start.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Toronto'
      });
      const endStr = end.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Toronto'
      });
      shiftInfo = ` | Shift: ${startStr} - ${endStr} EST`;
    }

    const topic = `On-Call: ${userName}${shiftInfo} | 🔧 Carlton One - Infrastructure`;

    await slackClient.conversations.setTopic({
      channel: channelId,
      topic: topic
    });

    console.log('✅ Channel topic updated!');
  } catch (error) {
    console.error('⚠️  Could not update channel topic:', error.message);
    // Don't throw - topic update is optional
  }
}

/**
 * Post general on-call for all teams (uses post-general-oncall.js logic)
 */
async function postGeneralAllTeams(channelId) {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    console.log(`📨 Posting ALL teams on-call to channel ${channelId}...`);

    // Temporarily set channel ID for the script
    const originalChannelId = process.env.SLACK_CHANNEL_ID;
    process.env.SLACK_CHANNEL_ID = channelId;

    // Run the general oncall script
    const { stdout, stderr } = await execPromise('node post-general-oncall.js');

    console.log(stdout);
    if (stderr) console.error(stderr);

    // Restore original channel ID
    process.env.SLACK_CHANNEL_ID = originalChannelId;

    console.log('✅ General all-teams on-call posted!');
    return { mode: 'general-all-teams', success: true };

  } catch (error) {
    console.error('Error posting general on-call:', error.message);
    throw error;
  }
}

/**
 * Post on-call information to Slack
 */
async function postOnCallToSlack(scheduleId = null, channelId = null, mode = 'full') {
  try {
    const targetChannel = channelId || config.slack.channelId;

    // If general-all-teams mode, use the general oncall script
    if (mode === 'general-all-teams') {
      return await postGeneralAllTeams(targetChannel);
    }

    console.log('Fetching on-call information from Datadog...');

    // Get schedule details first to get the name
    let scheduleName = null;
    if (scheduleId) {
      const scheduleUrl = `https://api.${config.datadog.site}/api/v2/on-call/schedules/${scheduleId}`;
      const scheduleResponse = await axios.get(scheduleUrl, {
        headers: {
          'DD-API-KEY': config.datadog.apiKey,
          'DD-APPLICATION-KEY': config.datadog.appKey
        }
      });
      scheduleName = scheduleResponse.data.data.attributes.name;
    }

    const onCallData = scheduleId
      ? await getScheduleOnCall(scheduleId)
      : await getOnCallInfo();

    // If topic-only mode, just update the topic
    if (mode === 'topic-only') {
      console.log(`📝 Topic-only mode: Updating channel topic for ${targetChannel}...`);
      await updateChannelTopicForChannel(onCallData, scheduleName, targetChannel);
      console.log('✅ Topic updated successfully!');
      return { mode: 'topic-only', success: true };
    }

    // Message-only or full mode: post message
    console.log('Formatting message...');
    const message = formatOnCallMessage(onCallData, scheduleName);

    console.log(`Posting to Slack channel: ${targetChannel}`);
    const result = await slackClient.chat.postMessage({
      channel: targetChannel,
      ...message
    });

    console.log('✅ Message posted successfully!');

    // Update channel topic only if full mode (not message-only)
    if (mode === 'full') {
      console.log('Updating channel topic...');
      await updateChannelTopicForChannel(onCallData, scheduleName, targetChannel);
    }

    // Pin the message if configured
    if (config.pinMessage && result.ts) {
      console.log('Pinning message to channel...');
      await slackClient.pins.add({
        channel: targetChannel,
        timestamp: result.ts
      });
      console.log('✅ Message pinned successfully!');
    }

    return result;
  } catch (error) {
    console.error('Error posting to Slack:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Validate configuration
 */
function validateConfig() {
  const required = {
    'DATADOG_API_KEY': config.datadog.apiKey,
    'DATADOG_APP_KEY': config.datadog.appKey,
    'SLACK_BOT_TOKEN': config.slack.token,
    'SLACK_CHANNEL_ID': config.slack.channelId
  };

  const missing = [];
  for (const [key, value] of Object.entries(required)) {
    if (!value || value.includes('your_')) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required configuration:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease update your .env file with the correct values.');
    process.exit(1);
  }
}

/**
 * Start the bot with scheduled posts
 */
function startScheduledBot() {
  console.log('🤖 On-Call Slack Bot starting...');
  console.log(`📌 Pin messages: ${config.pinMessage}`);

  validateConfig();

  // Check if we have multi-channel configuration
  if (config.channels && config.channels.length > 0) {
    console.log(`\n📢 Multi-channel mode: ${config.channels.length} channels configured`);

    config.channels.forEach((channel, index) => {
      console.log(`\nChannel ${index + 1}: ${channel.name}`);
      console.log(`  📍 Channel ID: ${channel.id}`);
      console.log(`  📅 Schedule: ${channel.cronSchedule}`);
      console.log(`  🎯 Datadog Schedule: ${channel.scheduleId}`);

      // Schedule cron job for each channel
      cron.schedule(channel.cronSchedule, async () => {
        console.log(`\n⏰ Scheduled post for ${channel.name} at ${new Date().toISOString()}`);
        console.log(`   Mode: ${channel.mode}`);
        try {
          await postOnCallToSlack(channel.scheduleId, channel.id, channel.mode);
        } catch (error) {
          console.error(`Failed to post to ${channel.name}:`, error);
        }
      }, {
        timezone: 'America/Toronto'
      });
    });

    console.log('\n✅ Bot is running! Waiting for scheduled posts...');
    console.log('Press Ctrl+C to stop.\n');
  } else {
    // Legacy single-channel mode
    console.log(`📅 Schedule: ${config.cronSchedule}`);
    console.log(`📍 Channel: ${config.slack.channelId}`);

    // Schedule the cron job
    cron.schedule(config.cronSchedule, async () => {
      console.log(`\n⏰ Scheduled post triggered at ${new Date().toISOString()}`);
      try {
        await postOnCallToSlack(config.datadog.scheduleId);
      } catch (error) {
        console.error('Failed to post scheduled update:', error);
      }
    }, {
      timezone: 'America/Toronto'
    });

    console.log('\n✅ Bot is running! Waiting for scheduled posts...');
    console.log('Press Ctrl+C to stop.\n');
  }
}

/**
 * Post immediately (for testing)
 */
async function postNow() {
  console.log('🤖 Posting on-call information now...\n');
  validateConfig();

  try {
    await postOnCallToSlack(config.datadog.scheduleId);
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to post:', error.message);
    process.exit(1);
  }
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

if (command === 'now' || command === 'test') {
  postNow();
} else if (command === 'start' || !command) {
  startScheduledBot();
} else {
  console.log('Usage:');
  console.log('  node index.js start    - Start the bot with scheduled posts (default)');
  console.log('  node index.js now      - Post on-call information immediately');
  console.log('  node index.js test     - Same as "now", for testing');
  process.exit(1);
}
