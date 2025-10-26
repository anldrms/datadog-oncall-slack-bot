require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN;
const channelId = process.argv[2];

if (!token || token.includes('your-bot-token')) {
  console.error('❌ SLACK_BOT_TOKEN not configured in .env file');
  process.exit(1);
}

if (!channelId) {
  console.log('Usage: node test-post.js <channel-id>');
  console.log('\nTo get your channel ID:');
  console.log('1. Right-click the channel in Slack');
  console.log('2. Select "View channel details"');
  console.log('3. Copy the Channel ID at the bottom');
  console.log('\nExample: node test-post.js C1234567890');
  process.exit(1);
}

const client = new WebClient(token);

async function testPost() {
  console.log('🔍 Testing Slack bot...\n');

  try {
    // Test authentication
    console.log('1️⃣ Validating bot token...');
    const authTest = await client.auth.test();
    console.log('✅ Bot token is valid!');
    console.log(`   Bot Name: @${authTest.user}`);
    console.log(`   Workspace: ${authTest.team}\n`);

    // Test posting
    console.log(`2️⃣ Attempting to post to channel: ${channelId}...`);
    const result = await client.chat.postMessage({
      channel: channelId,
      text: '✅ Test message from On-Call Bot!',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '✅ Configuration Test Successful!'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Your On-Call Bot is working!*\n\nThe bot can successfully post messages to this channel.\n\nNext steps:\n• Configure your Datadog Schedule ID\n• Set up the posting schedule\n• Run `npm start` to begin scheduled posts'
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `_Test posted at ${new Date().toLocaleString()}_`
            }
          ]
        }
      ]
    });

    console.log('✅ Test message posted successfully!');
    console.log(`   Message timestamp: ${result.ts}`);
    console.log(`   Channel: ${channelId}\n`);

    // Test pinning (if enabled)
    if (process.env.PIN_MESSAGE === 'true') {
      console.log('3️⃣ Testing message pinning...');
      try {
        await client.pins.add({
          channel: channelId,
          timestamp: result.ts
        });
        console.log('✅ Message pinned successfully!\n');
      } catch (pinError) {
        console.log('⚠️  Could not pin message:', pinError.message);
        console.log('   (This is optional - the bot still works)\n');
      }
    }

    console.log('🎉 All tests passed!\n');
    console.log('Your bot is ready to use!');
    console.log('\nUpdate your .env file with:');
    console.log(`   SLACK_CHANNEL_ID=${channelId}`);
    console.log('\nThen run:');
    console.log('   npm test     - to test with on-call data');
    console.log('   npm start    - to start scheduled posts');

  } catch (error) {
    console.error('\n❌ Error:');
    console.error('   ' + error.message);

    if (error.message.includes('channel_not_found')) {
      console.error('\n💡 The channel ID is invalid or the bot cannot access it.');
      console.error('   - Double-check the channel ID');
      console.error('   - For private channels, invite the bot: /invite @' + (authTest?.user || 'oncall_bot'));
    } else if (error.message.includes('invalid_auth')) {
      console.error('\n💡 The bot token is invalid.');
      console.error('   Get a new token from: https://api.slack.com/apps/A09NQDZFEUR/oauth');
    } else if (error.message.includes('not_in_channel')) {
      console.error('\n💡 The bot is not in this channel.');
      console.error('   For private channels, invite the bot: /invite @' + (authTest?.user || 'oncall_bot'));
    }

    process.exit(1);
  }
}

testPost();
