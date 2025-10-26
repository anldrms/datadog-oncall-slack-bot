require('dotenv').config();
const axios = require('axios');

const config = {
  apiKey: process.env.DATADOG_API_KEY,
  appKey: process.env.DATADOG_APP_KEY,
  site: process.env.DATADOG_SITE
};

async function listSchedules() {
  console.log('📋 Available Datadog On-Call Schedules:\n');

  try {
    const url = `https://api.${config.site}/api/v2/on-call/schedules`;
    const response = await axios.get(url, {
      headers: {
        'DD-API-KEY': config.apiKey,
        'DD-APPLICATION-KEY': config.appKey
      }
    });

    if (response.data.data && response.data.data.length > 0) {
      response.data.data.forEach((schedule, idx) => {
        console.log(`${idx + 1}. ${schedule.attributes.name}`);
        console.log(`   ID: ${schedule.id}`);
        console.log(`   Timezone: ${schedule.attributes.time_zone}`);
        console.log('');
      });

      console.log(`\nTotal: ${response.data.data.length} schedules`);
    } else {
      console.log('No schedules found.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listSchedules();
