require('dotenv').config();
const axios = require('axios');

// Configuration
const config = {
  datadog: {
    apiKey: process.env.DATADOG_API_KEY,
    appKey: process.env.DATADOG_APP_KEY,
    site: process.env.DATADOG_SITE || 'datadoghq.eu',
  },
  channels: [
    {
      id: process.env.SLACK_CHANNEL_1_ID,
      scheduleId: process.env.SLACK_CHANNEL_1_SCHEDULE_ID,
      name: 'c1-oncall-bot',
      mode: 'general-all-teams'
    },
    {
      id: process.env.SLACK_CHANNEL_2_ID,
      scheduleId: process.env.SLACK_CHANNEL_2_SCHEDULE_ID,
      name: 'system-production',
      mode: 'topic-only'
    }
  ]
};

/**
 * Test Datadog API connection for a specific schedule
 */
async function testDatadogSchedule(scheduleId, scheduleName) {
  try {
    console.log(`\n📋 Testing: ${scheduleName}`);
    console.log(`   Schedule ID: ${scheduleId}`);

    // Get schedule details
    const scheduleUrl = `https://api.${config.datadog.site}/api/v2/on-call/schedules/${scheduleId}`;
    const scheduleResponse = await axios.get(scheduleUrl, {
      headers: {
        'DD-API-KEY': config.datadog.apiKey,
        'DD-APPLICATION-KEY': config.datadog.appKey
      }
    });

    const scheduleNameFromAPI = scheduleResponse.data.data.attributes.name;
    console.log(`   ✅ Schedule found: "${scheduleNameFromAPI}"`);

    // Get current on-call
    const onCallUrl = `https://api.${config.datadog.site}/api/v2/on-call/schedules/${scheduleId}/on-call`;
    const onCallResponse = await axios.get(onCallUrl, {
      headers: {
        'DD-API-KEY': config.datadog.apiKey,
        'DD-APPLICATION-KEY': config.datadog.appKey,
        'Content-Type': 'application/json'
      },
      params: {
        include: 'user'
      }
    });

    const onCallData = onCallResponse.data;

    if (onCallData && onCallData.data) {
      const attributes = onCallData.data.attributes || {};
      let user = null;
      if (onCallData.included && onCallData.included.length > 0) {
        user = onCallData.included.find(item => item.type === 'users');
      }

      const userName = user?.attributes?.name || user?.attributes?.email || 'Unknown User';
      const userEmail = user?.attributes?.email || '';

      const start = attributes.start ? new Date(attributes.start) : null;
      const end = attributes.end ? new Date(attributes.end) : null;

      console.log(`   👤 Current On-Call: ${userName}`);
      if (userEmail) console.log(`   📧 Email: ${userEmail}`);

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
        console.log(`   ⏰ Shift: ${startStr} - ${endStr} EST`);
      }

      return { success: true, userName, userEmail };
    } else {
      console.log(`   ⚠️  No one currently on-call`);
      return { success: true, noOnCall: true };
    }

  } catch (error) {
    console.error(`   ❌ Error: ${error.response?.data?.errors?.[0]?.detail || error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test all configured channels
 */
async function testAllChannels() {
  console.log('🔍 Testing Datadog API Connection (NO messages will be sent to Slack)');
  console.log('='.repeat(70));

  const results = [];

  for (const channel of config.channels) {
    const result = await testDatadogSchedule(channel.scheduleId, channel.name);
    results.push({
      channel: channel.name,
      mode: channel.mode,
      ...result
    });
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 Summary:');
  console.log('='.repeat(70));

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.channel} (${result.mode})`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });

  const allSuccess = results.every(r => r.success);

  console.log('\n' + '='.repeat(70));
  if (allSuccess) {
    console.log('✅ All channels are configured correctly!');
    console.log('🤖 Bot is ready and waiting for scheduled times:');
    console.log('   • c1-oncall-bot: Every day at 9:00 AM EST');
    console.log('   • system-production: Every Monday at 8:00 AM EST');
  } else {
    console.log('⚠️  Some channels have configuration issues.');
  }
  console.log('='.repeat(70));
}

// Run the test
testAllChannels().catch(console.error);
