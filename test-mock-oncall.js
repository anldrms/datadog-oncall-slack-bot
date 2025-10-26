require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
const channelId = process.env.SLACK_CHANNEL_ID;

// Mock on-call data
const mockOnCallData = {
  data: [
    {
      attributes: {
        schedule: {
          id: 'schedule-123',
          name: 'Platform Team Schedule'
        },
        user: {
          name: 'John Doe',
          email: 'john.doe@company.com'
        },
        start: new Date().toISOString(),
        end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    },
    {
      attributes: {
        schedule: {
          id: 'schedule-456',
          name: 'Database Team Schedule'
        },
        user: {
          name: 'Jane Smith',
          email: 'jane.smith@company.com'
        },
        start: new Date().toISOString(),
        end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    }
  ]
};

function formatOnCallMessage(onCallData) {
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🚨 Today\'s On-Call Engineers'
      }
    },
    {
      type: 'divider'
    }
  ];

  onCallData.data.forEach((oncall, index) => {
    const schedule = oncall.attributes?.schedule;
    const user = oncall.attributes?.user;
    const start = oncall.attributes?.start ? new Date(oncall.attributes.start) : null;
    const end = oncall.attributes?.end ? new Date(oncall.attributes.end) : null;

    const scheduleName = schedule?.name || 'Unknown Schedule';
    const userName = user?.name || user?.email || 'Unknown User';
    const userEmail = user?.email || '';

    let timeRange = '';
    if (start && end) {
      timeRange = `\n⏰ *Shift:* ${start.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })} - ${end.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*📋 ${scheduleName}*\n👤 *Engineer:* ${userName}${userEmail ? ` (${userEmail})` : ''}${timeRange}`
      }
    });

    if (index < onCallData.data.length - 1) {
      blocks.push({ type: 'divider' });
    }
  });

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `_⚠️ This is a MOCK TEST with sample data | Updated: ${new Date().toLocaleString('en-US')}_`
      }
    ]
  });

  return {
    text: '🚨 Today\'s On-Call Engineers (TEST)',
    blocks: blocks
  };
}

async function testMockPost() {
  console.log('🧪 Testing bot with MOCK on-call data...\n');

  try {
    console.log('1️⃣ Generating mock on-call data...');
    const message = formatOnCallMessage(mockOnCallData);
    console.log('✅ Mock data formatted\n');

    console.log('2️⃣ Posting to Slack...');
    const result = await slackClient.chat.postMessage({
      channel: channelId,
      ...message
    });
    console.log('✅ Message posted successfully!\n');

    if (process.env.PIN_MESSAGE === 'true') {
      console.log('3️⃣ Pinning message...');
      await slackClient.pins.add({
        channel: channelId,
        timestamp: result.ts
      });
      console.log('✅ Message pinned!\n');
    }

    console.log('🎉 Full workflow test completed!\n');
    console.log('This shows what the bot will post when Datadog on-call data is available.');
    console.log('\nCheck the #oncall-bot channel to see the formatted message!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testMockPost();
