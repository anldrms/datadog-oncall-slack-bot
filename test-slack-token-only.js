require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

async function testSlackToken() {
  console.log('🔍 Testing Slack Bot Token (NO messages will be sent)');
  console.log('='.repeat(70));

  try {
    // Test auth
    console.log('\n📝 Testing authentication...');
    const authResult = await slackClient.auth.test();
    console.log(`   ✅ Bot authenticated!`);
    console.log(`   🤖 Bot Name: ${authResult.user}`);
    console.log(`   🏢 Workspace: ${authResult.team}`);
    console.log(`   🆔 Bot User ID: ${authResult.user_id}`);

    // Test channel access
    const channels = [
      { id: process.env.SLACK_CHANNEL_1_ID, name: 'c1-oncall-bot' },
      { id: process.env.SLACK_CHANNEL_2_ID, name: 'system-production' }
    ];

    console.log('\n📋 Testing channel access...');
    for (const channel of channels) {
      try {
        const info = await slackClient.conversations.info({
          channel: channel.id
        });
        console.log(`   ✅ ${channel.name}: Accessible`);
        console.log(`      Channel Name: #${info.channel.name}`);
        console.log(`      Is Member: ${info.channel.is_member ? 'Yes' : 'No (can still post with chat:write.public)'}`);
      } catch (error) {
        console.log(`   ❌ ${channel.name}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Slack bot token is valid and working!');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Error testing Slack token:', error.message);
    console.log('\n' + '='.repeat(70));
    console.log('⚠️  Slack bot token may be invalid or expired.');
    console.log('='.repeat(70));
  }
}

testSlackToken();
