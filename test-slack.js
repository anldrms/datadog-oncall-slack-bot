require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN;

if (!token || token.includes('your-bot-token')) {
  console.error('❌ SLACK_BOT_TOKEN not configured in .env file');
  process.exit(1);
}

const client = new WebClient(token);

async function testSlack() {
  console.log('🔍 Testing Slack connection...\n');

  try {
    // Test authentication
    console.log('1️⃣ Testing bot token...');
    const authTest = await client.auth.test();
    console.log('✅ Bot token is valid!');
    console.log(`   Bot Name: ${authTest.user}`);
    console.log(`   Workspace: ${authTest.team}`);
    console.log(`   Bot ID: ${authTest.user_id}\n`);

    // List channels
    console.log('2️⃣ Fetching available channels...');
    const channels = await client.conversations.list({
      types: 'public_channel,private_channel',
      exclude_archived: true,
      limit: 50
    });

    if (channels.channels && channels.channels.length > 0) {
      console.log(`✅ Found ${channels.channels.length} channels:\n`);
      channels.channels.forEach((channel, idx) => {
        const privacy = channel.is_private ? '🔒' : '📢';
        const member = channel.is_member ? '✓ (bot is member)' : '';
        console.log(`   ${idx + 1}. ${privacy} #${channel.name} - ${channel.id} ${member}`);
      });

      console.log('\n📝 To use a channel, update your .env file:');
      console.log('   SLACK_CHANNEL_ID=<channel-id-from-above>');
      console.log('\n💡 For private channels, invite the bot first: /invite @' + authTest.user);
    } else {
      console.log('⚠️  No channels found');
    }

    console.log('\n✅ Slack connection test successful!');
    console.log('\nNext steps:');
    console.log('1. Choose a channel from the list above');
    console.log('2. Update SLACK_CHANNEL_ID in .env file');
    console.log('3. Run: npm test');

  } catch (error) {
    console.error('❌ Error testing Slack:');
    console.error('   ' + error.message);

    if (error.message.includes('invalid_auth')) {
      console.error('\n💡 The bot token is invalid or has been revoked.');
      console.error('   Get a new token from: https://api.slack.com/apps/A09NQDZFEUR/oauth');
    }

    process.exit(1);
  }
}

testSlack();
