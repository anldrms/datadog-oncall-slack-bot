require('dotenv').config();
const axios = require('axios');

const config = {
  apiKey: process.env.DATADOG_API_KEY,
  appKey: process.env.DATADOG_APP_KEY,
  site: process.env.DATADOG_SITE || 'datadoghq.eu',
  scheduleId: process.env.DATADOG_SCHEDULE_ID
};

async function testDatadogSchedule() {
  console.log('🔍 Testing Datadog On-Call Schedule Access...\n');
  console.log(`Site: ${config.site}`);
  console.log(`Schedule ID: ${config.scheduleId}\n`);

  const headers = {
    'DD-API-KEY': config.apiKey,
    'DD-APPLICATION-KEY': config.appKey,
    'Content-Type': 'application/json'
  };

  try {
    // Test 1: Try to get specific schedule
    console.log('1️⃣ Trying to fetch specific schedule...');
    const scheduleUrl = `https://api.${config.site}/api/v2/on-call/schedules/${config.scheduleId}`;
    console.log(`   URL: ${scheduleUrl}`);

    try {
      const scheduleResponse = await axios.get(scheduleUrl, { headers });
      console.log('✅ Schedule found!');
      console.log(JSON.stringify(scheduleResponse.data, null, 2));
    } catch (scheduleError) {
      console.log(`   ⚠️  Status: ${scheduleError.response?.status}`);
      console.log(`   Error: ${JSON.stringify(scheduleError.response?.data)}\n`);
    }

    // Test 2: Try listing all schedules
    console.log('2️⃣ Trying to list all schedules...');
    const schedulesUrl = `https://api.${config.site}/api/v2/on-call/schedules`;
    console.log(`   URL: ${schedulesUrl}`);

    try {
      const schedulesResponse = await axios.get(schedulesUrl, { headers });
      console.log('✅ Schedules API accessible!');
      if (schedulesResponse.data.data) {
        console.log(`   Found ${schedulesResponse.data.data.length} schedule(s)`);
        schedulesResponse.data.data.forEach(schedule => {
          console.log(`   - ${schedule.attributes?.name || 'Unnamed'} (${schedule.id})`);
        });
      }
    } catch (schedulesError) {
      console.log(`   ⚠️  Status: ${schedulesError.response?.status}`);
      console.log(`   Error: ${JSON.stringify(schedulesError.response?.data)}\n`);
    }

    // Test 3: Try on-calls endpoint (current approach)
    console.log('3️⃣ Trying on-calls endpoint...');
    const now = new Date();
    const until = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const oncallsUrl = `https://api.${config.site}/api/v2/on-call/oncalls`;
    console.log(`   URL: ${oncallsUrl}`);

    try {
      const oncallsResponse = await axios.get(oncallsUrl, {
        headers,
        params: {
          schedule_ids: config.scheduleId,
          start: now.toISOString(),
          end: until.toISOString()
        }
      });
      console.log('✅ On-calls API accessible!');
      console.log(JSON.stringify(oncallsResponse.data, null, 2));
    } catch (oncallsError) {
      console.log(`   ⚠️  Status: ${oncallsError.response?.status}`);
      console.log(`   Error: ${JSON.stringify(oncallsError.response?.data)}\n`);
    }

    // Test 4: Try different API version
    console.log('4️⃣ Trying v1 API...');
    const v1Url = `https://api.${config.site}/api/v1/on-call/schedules`;
    console.log(`   URL: ${v1Url}`);

    try {
      const v1Response = await axios.get(v1Url, { headers });
      console.log('✅ V1 API accessible!');
      console.log(JSON.stringify(v1Response.data, null, 2));
    } catch (v1Error) {
      console.log(`   ⚠️  Status: ${v1Error.response?.status}`);
      console.log(`   Error: ${JSON.stringify(v1Error.response?.data)}\n`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testDatadogSchedule();
