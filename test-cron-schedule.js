require('dotenv').config();
const cron = require('node-cron');

console.log('🕐 Testing Cron Schedules');
console.log('='.repeat(70));

const channels = [
  {
    id: process.env.SLACK_CHANNEL_1_ID,
    name: 'c1-oncall-bot',
    cronSchedule: '0 9 * * *',
    mode: 'general-all-teams'
  },
  {
    id: process.env.SLACK_CHANNEL_2_ID,
    name: 'system-production',
    cronSchedule: '0 8 * * 1',
    mode: 'topic-only'
  }
];

// Test if cron expressions are valid
console.log('\n✅ Validating cron expressions:\n');

channels.forEach(channel => {
  console.log(`📋 ${channel.name}:`);
  console.log(`   Schedule: ${channel.cronSchedule}`);
  console.log(`   Mode: ${channel.mode}`);

  const isValid = cron.validate(channel.cronSchedule);
  console.log(`   Valid: ${isValid ? '✅ Yes' : '❌ No'}`);

  if (isValid) {
    // Interpret the schedule
    const parts = channel.cronSchedule.split(' ');
    const minute = parts[0];
    const hour = parts[1];
    const dayOfMonth = parts[2];
    const month = parts[3];
    const dayOfWeek = parts[4];

    let description = 'Runs: ';

    if (dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      description += `Every ${days[parseInt(dayOfWeek)]} `;
    } else if (dayOfMonth !== '*') {
      description += `Day ${dayOfMonth} of every month `;
    } else {
      description += 'Every day ';
    }

    description += `at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

    console.log(`   ${description}`);
  }

  console.log();
});

// Get next execution times
console.log('='.repeat(70));
console.log('\n📅 Next scheduled executions (based on current system time):\n');

const now = new Date();
console.log(`Current system time: ${now.toLocaleString('en-US', { timeZone: 'America/Toronto' })} EST\n`);

// Calculate next run for channel 1 (every day at 9 AM)
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(9, 0, 0, 0);
console.log(`c1-oncall-bot next run: ${tomorrow.toLocaleString('en-US', { timeZone: 'America/Toronto' })} EST`);

// Calculate next run for channel 2 (every Monday at 8 AM)
const nextMonday = new Date(now);
const daysUntilMonday = (8 - nextMonday.getDay()) % 7 || 7;
nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
nextMonday.setHours(8, 0, 0, 0);
console.log(`system-production next run: ${nextMonday.toLocaleString('en-US', { timeZone: 'America/Toronto' })} EST`);

console.log('\n' + '='.repeat(70));

// Start a test cron job that logs every minute
console.log('\n🧪 Starting a 1-minute test cron to verify cron is working...');
console.log('(Will log every minute for 3 minutes, then exit)\n');

let counter = 0;
const testCron = cron.schedule('* * * * *', () => {
  counter++;
  const now = new Date();
  console.log(`✅ Test cron tick ${counter}/3 at ${now.toLocaleTimeString('en-US', { timeZone: 'America/Toronto' })} EST`);

  if (counter >= 3) {
    testCron.stop();
    console.log('\n✅ Cron is working correctly!');
    console.log('\nYour bot should be posting at the scheduled times.');
    console.log('If messages are not appearing, check:');
    console.log('  1. The bot process is running (ps aux | grep "node.*index.js")');
    console.log('  2. Bot has necessary Slack permissions');
    console.log('  3. System time is correct');
    process.exit(0);
  }
});

console.log('Waiting for cron ticks...');
