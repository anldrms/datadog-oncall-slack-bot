require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const client = new WebClient(process.env.SLACK_BOT_TOKEN);
const channelId = process.env.SLACK_CHANNEL_ID;

async function testTopicUpdate() {
  console.log('🔍 Testing channel topic update...\n');

  try {
    // First, check what scopes we have
    console.log('1️⃣ Checking bot permissions...');
    const authTest = await client.auth.test();
    console.log(`   Bot: ${authTest.user}`);
    console.log(`   Workspace: ${authTest.team}\n`);

    // Try to get channel info
    console.log('2️⃣ Getting channel information...');
    const channelInfo = await client.conversations.info({
      channel: channelId
    });
    console.log(`   Channel: #${channelInfo.channel.name}`);
    console.log(`   Current topic: "${channelInfo.channel.topic.value}"\n`);

    // Try to update topic
    console.log('3️⃣ Attempting to update channel topic...');
    const newTopic = `🔧 Carlton One - Test Topic Update | Time: ${new Date().toLocaleTimeString()}`;

    await client.conversations.setTopic({
      channel: channelId,
      topic: newTopic
    });

    console.log('✅ Topic updated successfully!');
    console.log(`   New topic: "${newTopic}"\n`);

    console.log('🎉 All tests passed! The bot can update channel topics.');

  } catch (error) {
    console.error('❌ Error:', error.data?.error || error.message);

    if (error.data?.error === 'missing_scope') {
      console.error('\n📝 MISSING SCOPE: channels:manage');
      console.error('\nTo fix this:');
      console.error('1. Go to: https://api.slack.com/apps/A09NQDZFEUR/oauth');
      console.error('2. Under "Bot Token Scopes", add: channels:manage');
      console.error('3. Click "Reinstall to Workspace"');
      console.error('4. Copy the NEW bot token');
      console.error('5. Update SLACK_BOT_TOKEN in .env file');
      console.error('6. Run this test again');
    } else if (error.data?.error === 'not_in_channel') {
      console.error('\n📝 Bot is not in the channel');
      console.error('\nTo fix this:');
      console.error(`1. Go to the #${channelInfo?.channel?.name || 'channel'} in Slack`);
      console.error('2. Invite the bot: /invite @oncall_bot');
      console.error('3. Run this test again');
    } else {
      console.error('\nUnexpected error. Check the error message above.');
    }

    process.exit(1);
  }
}

testTopicUpdate();
