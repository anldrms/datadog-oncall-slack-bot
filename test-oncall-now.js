require('dotenv').config();
const axios = require('axios');

const config = {
  apiKey: process.env.DATADOG_API_KEY,
  appKey: process.env.DATADOG_APP_KEY,
  site: process.env.DATADOG_SITE || 'datadoghq.eu',
  scheduleId: process.env.DATADOG_SCHEDULE_ID
};

async function testGetCurrentOnCall() {
  console.log('🔍 Finding how to get current on-call information...\n');

  const headers = {
    'DD-API-KEY': config.apiKey,
    'DD-APPLICATION-KEY': config.appKey
  };

  try {
    // Get the schedule details
    console.log('1️⃣ Fetching schedule details...');
    const scheduleUrl = `https://api.${config.site}/api/v2/on-call/schedules/${config.scheduleId}`;
    const scheduleResponse = await axios.get(scheduleUrl, {
      headers,
      params: {
        'include[]': ['layers', 'users']
      }
    });

    console.log('✅ Schedule:', scheduleResponse.data.data.attributes.name);
    console.log('   Timezone:', scheduleResponse.data.data.attributes.time_zone);

    // Check if there's included data
    if (scheduleResponse.data.included) {
      console.log(`\n   Included data: ${scheduleResponse.data.included.length} items`);
      scheduleResponse.data.included.forEach(item => {
        console.log(`   - Type: ${item.type}, ID: ${item.id}`);
      });
    }

    // Try getting overrides
    console.log('\n2️⃣ Trying to get schedule overrides...');
    const overridesUrl = `https://api.${config.site}/api/v2/on-call/schedules/${config.scheduleId}/overrides`;
    try {
      const overridesResponse = await axios.get(overridesUrl, { headers });
      console.log('✅ Overrides endpoint works!');
      console.log(JSON.stringify(overridesResponse.data, null, 2));
    } catch (err) {
      console.log(`   ⚠️  ${err.response?.status}: ${JSON.stringify(err.response?.data)}`);
    }

    // Try getting final schedule (who's actually on call)
    console.log('\n3️⃣ Trying to get final schedule (who is on-call)...');
    const now = new Date();
    const later = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const finalUrl = `https://api.${config.site}/api/v2/on-call/schedules/${config.scheduleId}/final-schedule`;
    try {
      const finalResponse = await axios.get(finalUrl, {
        headers,
        params: {
          start: now.toISOString(),
          end: later.toISOString()
        }
      });
      console.log('✅ Final schedule endpoint works!');
      console.log(JSON.stringify(finalResponse.data, null, 2));
    } catch (err) {
      console.log(`   ⚠️  ${err.response?.status}: ${JSON.stringify(err.response?.data)}`);
    }

    // Try alternate parameters
    console.log('\n4️⃣ Trying with Unix timestamps...');
    const nowUnix = Math.floor(now.getTime() / 1000);
    const laterUnix = Math.floor(later.getTime() / 1000);

    try {
      const finalResponse2 = await axios.get(finalUrl, {
        headers,
        params: {
          start: nowUnix,
          end: laterUnix
        }
      });
      console.log('✅ Unix timestamps work!');
      console.log(JSON.stringify(finalResponse2.data, null, 2));
    } catch (err) {
      console.log(`   ⚠️  ${err.response?.status}: ${JSON.stringify(err.response?.data)}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testGetCurrentOnCall();
