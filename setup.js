require('dotenv').config();
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { WebClient } = require('@slack/web-api');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function print(message) {
  console.log(message);
}

function printHeader(title) {
  console.log('\n' + '='.repeat(60));
  console.log(title);
  console.log('='.repeat(60) + '\n');
}

async function validateDatadogCredentials(apiKey, appKey, site) {
  try {
    const url = `https://api.${site}/api/v1/validate`;
    await axios.get(url, {
      headers: {
        'DD-API-KEY': apiKey,
        'DD-APPLICATION-KEY': appKey
      }
    });
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error.response?.data?.errors?.[0] || error.message
    };
  }
}

async function fetchDatadogSchedules(apiKey, appKey, site) {
  try {
    const url = `https://api.${site}/api/v2/oncalls`;
    const now = new Date();
    const until = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const response = await axios.get(url, {
      headers: {
        'DD-API-KEY': apiKey,
        'DD-APPLICATION-KEY': appKey
      },
      params: {
        from: now.toISOString(),
        to: until.toISOString()
      }
    });

    // Extract unique schedules
    const schedules = [];
    const seen = new Set();

    if (response.data.data) {
      response.data.data.forEach(oncall => {
        const schedule = oncall.attributes?.schedule;
        if (schedule && schedule.id && !seen.has(schedule.id)) {
          seen.add(schedule.id);
          schedules.push({
            id: schedule.id,
            name: schedule.name || 'Unnamed Schedule'
          });
        }
      });
    }

    return { success: true, schedules };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

async function validateSlackToken(token) {
  try {
    const client = new WebClient(token);
    const result = await client.auth.test();
    return {
      valid: true,
      botId: result.bot_id,
      botName: result.user,
      teamName: result.team
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

async function fetchSlackChannels(token) {
  try {
    const client = new WebClient(token);
    const result = await client.conversations.list({
      types: 'public_channel,private_channel',
      exclude_archived: true,
      limit: 200
    });

    return {
      success: true,
      channels: result.channels.map(ch => ({
        id: ch.id,
        name: ch.name,
        isPrivate: ch.is_private
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testSlackPost(token, channelId) {
  try {
    const client = new WebClient(token);
    const result = await client.chat.postMessage({
      channel: channelId,
      text: '✅ Test message from On-Call Bot setup!',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '✅ *Configuration successful!*\n\nYour On-Call Bot is now configured and ready to post messages to this channel.'
          }
        }
      ]
    });
    return { success: true, messageTs: result.ts };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

function saveEnvFile(config) {
  const envPath = path.join(__dirname, '.env');
  const envContent = `# Datadog Configuration
DATADOG_API_KEY=${config.datadogApiKey}
DATADOG_APP_KEY=${config.datadogAppKey}
DATADOG_SITE=${config.datadogSite}
DATADOG_SCHEDULE_ID=${config.datadogScheduleId || ''}

# Slack Configuration
SLACK_BOT_TOKEN=${config.slackToken}
SLACK_CHANNEL_ID=${config.slackChannelId}

# Schedule Configuration (cron format)
# Examples:
# Every day at 9 AM: 0 9 * * *
# Every Monday at 9 AM: 0 9 * * 1
# Every 6 hours: 0 */6 * * *
CRON_SCHEDULE=${config.cronSchedule}

# Pin message to channel (true/false)
PIN_MESSAGE=${config.pinMessage}
`;

  fs.writeFileSync(envPath, envContent);
  print('\n✅ Configuration saved to .env file');
}

async function setupDatadog() {
  printHeader('📊 DATADOG CONFIGURATION');

  let apiKey, appKey, site;

  // Check if we already have values
  if (process.env.DATADOG_API_KEY && !process.env.DATADOG_API_KEY.includes('your_')) {
    print(`Current API Key: ${process.env.DATADOG_API_KEY.substring(0, 10)}...`);
    const useExisting = await question('Use existing API key? (y/n): ');
    if (useExisting.toLowerCase() === 'y') {
      apiKey = process.env.DATADOG_API_KEY;
    }
  }

  if (!apiKey) {
    apiKey = await question('Enter your Datadog API Key: ');
  }

  if (process.env.DATADOG_APP_KEY && !process.env.DATADOG_APP_KEY.includes('your_')) {
    print(`Current Application Key: ${process.env.DATADOG_APP_KEY.substring(0, 10)}...`);
    const useExisting = await question('Use existing Application key? (y/n): ');
    if (useExisting.toLowerCase() === 'y') {
      appKey = process.env.DATADOG_APP_KEY;
    }
  }

  if (!appKey) {
    appKey = await question('Enter your Datadog Application Key: ');
  }

  print('\nDatadog Sites:');
  print('  1. US1 (datadoghq.com) - Default US site');
  print('  2. US3 (us3.datadoghq.com)');
  print('  3. US5 (us5.datadoghq.com)');
  print('  4. EU1 (datadoghq.eu) - European site');
  print('  5. AP1 (ap1.datadoghq.com) - Asia Pacific');

  const siteChoice = await question('Select your Datadog site (1-5) [default: 4 - EU]: ');
  const sites = {
    '1': 'datadoghq.com',
    '2': 'us3.datadoghq.com',
    '3': 'us5.datadoghq.com',
    '4': 'datadoghq.eu',
    '5': 'ap1.datadoghq.com'
  };
  site = sites[siteChoice] || 'datadoghq.eu';

  print(`\n🔍 Validating credentials for ${site}...`);
  const validation = await validateDatadogCredentials(apiKey, appKey, site);

  if (!validation.valid) {
    print(`\n❌ Invalid credentials: ${validation.error}`);
    print('Please check your API keys and try again.');
    process.exit(1);
  }

  print('✅ Datadog credentials validated successfully!');

  // Fetch schedules
  print('\n🔍 Fetching available on-call schedules...');
  const schedulesResult = await fetchDatadogSchedules(apiKey, appKey, site);

  let scheduleId = '';
  if (schedulesResult.success && schedulesResult.schedules.length > 0) {
    print('\nAvailable schedules:');
    schedulesResult.schedules.forEach((schedule, idx) => {
      print(`  ${idx + 1}. ${schedule.name} (ID: ${schedule.id})`);
    });
    print(`  ${schedulesResult.schedules.length + 1}. Monitor ALL schedules`);
    print(`  ${schedulesResult.schedules.length + 2}. Enter Schedule ID manually`);

    const choice = await question(`\nSelect schedule (1-${schedulesResult.schedules.length + 2}): `);
    const choiceNum = parseInt(choice);

    if (choiceNum > 0 && choiceNum <= schedulesResult.schedules.length) {
      scheduleId = schedulesResult.schedules[choiceNum - 1].id;
      print(`✅ Selected: ${schedulesResult.schedules[choiceNum - 1].name}`);
    } else if (choiceNum === schedulesResult.schedules.length + 2) {
      scheduleId = await question('Enter Schedule ID: ');
    } else {
      print('✅ Will monitor ALL schedules');
    }
  } else {
    print('\n⚠️  No schedules found or unable to fetch schedules.');
    print('You can leave it empty to monitor all schedules, or enter a specific Schedule ID.');
    scheduleId = await question('Schedule ID (leave empty for all): ');
  }

  return { apiKey, appKey, site, scheduleId };
}

async function setupSlack() {
  printHeader('💬 SLACK CONFIGURATION');

  print('To get your Slack Bot Token:');
  print('1. Go to https://api.slack.com/apps');
  print('2. Select your app (or create a new one)');
  print('3. Go to "OAuth & Permissions"');
  print('4. Add these Bot Token Scopes:');
  print('   - chat:write');
  print('   - chat:write.public');
  print('   - pins:write (optional)');
  print('5. Click "Install to Workspace"');
  print('6. Copy the "Bot User OAuth Token" (starts with xoxb-)');
  print('');

  let token;
  if (process.env.SLACK_BOT_TOKEN && !process.env.SLACK_BOT_TOKEN.includes('your_')) {
    print(`Current token: ${process.env.SLACK_BOT_TOKEN.substring(0, 15)}...`);
    const useExisting = await question('Use existing token? (y/n): ');
    if (useExisting.toLowerCase() === 'y') {
      token = process.env.SLACK_BOT_TOKEN;
    }
  }

  if (!token) {
    token = await question('\nEnter your Slack Bot Token (xoxb-...): ');
  }

  print('\n🔍 Validating Slack token...');
  const validation = await validateSlackToken(token);

  if (!validation.valid) {
    print(`\n❌ Invalid token: ${validation.error}`);
    print('Please check your token and try again.');
    process.exit(1);
  }

  print(`✅ Connected to workspace: ${validation.teamName}`);
  print(`   Bot name: ${validation.botName}`);

  // Fetch channels
  print('\n🔍 Fetching available channels...');
  const channelsResult = await fetchSlackChannels(token);

  let channelId;
  if (channelsResult.success && channelsResult.channels.length > 0) {
    print('\nAvailable channels:');
    channelsResult.channels.slice(0, 20).forEach((channel, idx) => {
      const privacy = channel.isPrivate ? '🔒' : '📢';
      print(`  ${idx + 1}. ${privacy} #${channel.name} (${channel.id})`);
    });

    if (channelsResult.channels.length > 20) {
      print(`  ... and ${channelsResult.channels.length - 20} more channels`);
    }

    print(`  ${channelsResult.channels.length + 1}. Enter Channel ID manually`);

    const choice = await question(`\nSelect channel (1-${channelsResult.channels.length + 1}): `);
    const choiceNum = parseInt(choice);

    if (choiceNum > 0 && choiceNum <= channelsResult.channels.length) {
      channelId = channelsResult.channels[choiceNum - 1].id;
      print(`✅ Selected: #${channelsResult.channels[choiceNum - 1].name}`);
    } else {
      channelId = await question('Enter Channel ID: ');
    }
  } else {
    print('\n⚠️  Unable to fetch channels.');
    print('To get Channel ID:');
    print('1. Right-click on the channel in Slack');
    print('2. Select "View channel details"');
    print('3. Copy the Channel ID at the bottom');
    channelId = await question('\nEnter Channel ID: ');
  }

  // Test posting
  print('\n🧪 Testing message posting...');
  const testResult = await testSlackPost(token, channelId);

  if (!testResult.success) {
    print(`\n⚠️  Warning: Unable to post test message: ${testResult.error}`);
    print('The bot might not have access to this channel.');
    print('You can continue, but the bot might not work correctly.');
    const continue_ = await question('Continue anyway? (y/n): ');
    if (continue_.toLowerCase() !== 'y') {
      process.exit(1);
    }
  } else {
    print('✅ Test message posted successfully!');
    print('   Check the channel to see the test message.');
  }

  return { token, channelId };
}

async function setupSchedule() {
  printHeader('⏰ SCHEDULE CONFIGURATION');

  print('Configure when the bot should post on-call information:');
  print('');
  print('Common schedules:');
  print('  1. Every day at 9:00 AM (0 9 * * *)');
  print('  2. Every weekday at 9:00 AM (0 9 * * 1-5)');
  print('  3. Every day at 9 AM and 5 PM (0 9,17 * * *)');
  print('  4. Every Monday at 8:00 AM (0 8 * * 1)');
  print('  5. Every 6 hours (0 */6 * * *)');
  print('  6. Custom cron expression');
  print('');

  const choice = await question('Select schedule (1-6): ');
  const schedules = {
    '1': '0 9 * * *',
    '2': '0 9 * * 1-5',
    '3': '0 9,17 * * *',
    '4': '0 8 * * 1',
    '5': '0 */6 * * *'
  };

  let cronSchedule;
  if (choice === '6') {
    print('\nCron format: minute hour day month weekday');
    print('Example: 0 9 * * * = Every day at 9:00 AM');
    cronSchedule = await question('Enter cron expression: ');
  } else {
    cronSchedule = schedules[choice] || '0 9 * * *';
  }

  print(`\n✅ Schedule set to: ${cronSchedule}`);

  const pinChoice = await question('\nPin messages to channel? (y/n) [default: y]: ');
  const pinMessage = pinChoice.toLowerCase() !== 'n';

  return { cronSchedule, pinMessage: pinMessage ? 'true' : 'false' };
}

async function runSetup() {
  printHeader('🤖 ON-CALL SLACK BOT - SETUP WIZARD');

  print('Welcome! This wizard will help you configure the On-Call Slack Bot.');
  print('');

  try {
    // Step 1: Datadog
    const datadogConfig = await setupDatadog();

    // Step 2: Slack
    const slackConfig = await setupSlack();

    // Step 3: Schedule
    const scheduleConfig = await setupSchedule();

    // Save configuration
    printHeader('💾 SAVING CONFIGURATION');

    const config = {
      datadogApiKey: datadogConfig.apiKey,
      datadogAppKey: datadogConfig.appKey,
      datadogSite: datadogConfig.site,
      datadogScheduleId: datadogConfig.scheduleId,
      slackToken: slackConfig.token,
      slackChannelId: slackConfig.channelId,
      cronSchedule: scheduleConfig.cronSchedule,
      pinMessage: scheduleConfig.pinMessage
    };

    saveEnvFile(config);

    // Final summary
    printHeader('✅ SETUP COMPLETE!');

    print('Your bot is now configured with:');
    print(`  • Datadog Site: ${config.datadogSite}`);
    print(`  • Schedule: ${config.datadogScheduleId || 'ALL schedules'}`);
    print(`  • Slack Channel: ${config.slackChannelId}`);
    print(`  • Post Schedule: ${config.cronSchedule}`);
    print(`  • Pin Messages: ${config.pinMessage}`);
    print('');
    print('Next steps:');
    print('  1. Test the bot: npm test');
    print('  2. Start the bot: npm start');
    print('');
    print('For more information, see README.md');
    print('');

  } catch (error) {
    print(`\n❌ Setup failed: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

runSetup();
