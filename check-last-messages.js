require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

async function checkLastMessages() {
  console.log('🔍 Checking last messages in channels');
  console.log('='.repeat(70));

  const channels = [
    { id: process.env.SLACK_CHANNEL_1_ID, name: 'c1-oncall-bot' },
    { id: process.env.SLACK_CHANNEL_2_ID, name: 'system-production' }
  ];

  for (const channel of channels) {
    console.log(`\n📋 Channel: ${channel.name} (${channel.id})`);

    try {
      // Get channel info
      const info = await slack.conversations.info({
        channel: channel.id
      });
      console.log(`   Channel Name: #${info.channel.name}`);

      // Get channel topic
      if (info.channel.topic && info.channel.topic.value) {
        console.log(`   📌 Topic: ${info.channel.topic.value}`);
      }

      // Get last messages from bot
      const history = await slack.conversations.history({
        channel: channel.id,
        limit: 10
      });

      if (history.messages && history.messages.length > 0) {
        console.log(`\n   📨 Last messages from bot:`);

        let botMessages = 0;
        for (const msg of history.messages) {
          // Check if message is from our bot
          if (msg.bot_id || msg.username === 'c1_oncall_bot') {
            botMessages++;
            const timestamp = new Date(parseFloat(msg.ts) * 1000);
            const estTime = timestamp.toLocaleString('en-US', {
              timeZone: 'America/Toronto',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            const text = msg.text || (msg.blocks ? '[Has blocks/formatting]' : '[No text]');
            console.log(`      ${estTime} EST: ${text.substring(0, 100)}`);

            if (botMessages >= 3) break; // Only show last 3 bot messages
          }
        }

        if (botMessages === 0) {
          console.log(`      ⚠️ No messages from bot found in last 10 messages`);
        }
      } else {
        console.log(`   ⚠️ No messages found in channel`);
      }

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
}

checkLastMessages();
