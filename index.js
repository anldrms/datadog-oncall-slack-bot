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
  pinMessage: process.env.PIN_MESSAGE === 'true'
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
        text: '🚨 On-Call Engineer'
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
      text: `*📋 ${scheduleName || 'Schedule'}*\n👤 *Engineer:* ${userName}${userEmail ? ` (${userEmail})` : ''}${timeRange}`
    }
  });

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `_Updated: ${new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' })} EST_`
      }
    ]
  });

  return {
    text: '🚨 On-Call Engineer',
    blocks: blocks
  };
}

/**
 * Post on-call information to Slack
 */
async function postOnCallToSlack(scheduleId = null) {
  try {
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

    console.log('Formatting message...');
    const message = formatOnCallMessage(onCallData, scheduleName);

    console.log(`Posting to Slack channel: ${config.slack.channelId}`);
    const result = await slackClient.chat.postMessage({
      channel: config.slack.channelId,
      ...message
    });

    console.log('✅ Message posted successfully!');

    // Pin the message if configured
    if (config.pinMessage && result.ts) {
      console.log('Pinning message to channel...');
      await slackClient.pins.add({
        channel: config.slack.channelId,
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
  console.log(`📅 Schedule: ${config.cronSchedule}`);
  console.log(`📍 Channel: ${config.slack.channelId}`);
  console.log(`📌 Pin messages: ${config.pinMessage}`);

  validateConfig();

  // Schedule the cron job
  cron.schedule(config.cronSchedule, async () => {
    console.log(`\n⏰ Scheduled post triggered at ${new Date().toISOString()}`);
    try {
      await postOnCallToSlack(config.datadog.scheduleId);
    } catch (error) {
      console.error('Failed to post scheduled update:', error);
    }
  });

  console.log('\n✅ Bot is running! Waiting for scheduled posts...');
  console.log('Press Ctrl+C to stop.\n');
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
