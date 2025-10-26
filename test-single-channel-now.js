require('dotenv').config();
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function testC1OncallBot() {
  console.log('🧪 Testing c1-oncall-bot post (WILL POST TO SLACK!)');
  console.log('='.repeat(70));
  console.log('This will post to #c1-oncall-bot channel using general-all-teams mode\n');

  try {
    // Temporarily set channel ID to c1-oncall-bot
    process.env.SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_1_ID;

    console.log(`📍 Target Channel ID: ${process.env.SLACK_CHANNEL_ID}`);
    console.log(`📋 Mode: general-all-teams (uses post-general-oncall.js)`);
    console.log('\n▶️  Running post-general-oncall.js...\n');

    const { stdout, stderr } = await execPromise('node post-general-oncall.js');

    console.log(stdout);
    if (stderr) {
      console.error('Errors:', stderr);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Test complete! Check #c1-oncall-bot channel in Slack.');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nThis means the bot would fail when trying to post to c1-oncall-bot.');
  }
}

testC1OncallBot();
