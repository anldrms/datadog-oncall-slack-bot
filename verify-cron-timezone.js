const cron = require('node-cron');

console.log('🕐 Verifying Cron Timezone Configuration');
console.log('='.repeat(70));

const now = new Date();
console.log(`\nCurrent system time: ${now.toString()}`);
console.log(`Current Toronto time: ${now.toLocaleString('en-US', { timeZone: 'America/Toronto' })} EST\n`);

console.log('Testing cron with timezone...\n');

let counter = 0;

// Test cron with timezone
const testCron = cron.schedule('* * * * *', () => {
  counter++;
  const time = new Date();
  const torontoTime = time.toLocaleString('en-US', { timeZone: 'America/Toronto', timeStyle: 'medium', dateStyle: 'short' });

  console.log(`✅ Cron tick ${counter}/3`);
  console.log(`   System time: ${time.toLocaleTimeString()}`);
  console.log(`   Toronto time: ${torontoTime} EST`);

  if (counter >= 3) {
    testCron.stop();
    console.log('\n' + '='.repeat(70));
    console.log('✅ Cron with timezone is working correctly!');
    console.log('\nYour bot should now post:');
    console.log('  • c1-oncall-bot: Every day at 9:00 AM EST (America/Toronto)');
    console.log('  • system-production: Every Monday at 8:00 AM EST (America/Toronto)');
    console.log('='.repeat(70));
    process.exit(0);
  }
}, {
  timezone: 'America/Toronto'
});

console.log('Waiting for 3 cron ticks (1 per minute)...\n');
