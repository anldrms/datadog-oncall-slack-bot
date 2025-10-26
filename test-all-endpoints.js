require('dotenv').config();
const axios = require('axios');

const config = {
  apiKey: process.env.DATADOG_API_KEY,
  appKey: process.env.DATADOG_APP_KEY,
  site: process.env.DATADOG_SITE,
  scheduleId: process.env.DATADOG_SCHEDULE_ID
};

const headers = {
  'DD-API-KEY': config.apiKey,
  'DD-APPLICATION-KEY': config.appKey
};

async function tryEndpoint(name, url, method = 'GET', params = {}) {
  try {
    const response = await axios({
      method,
      url,
      headers,
      params
    });
    console.log(`✅ ${name}`);
    console.log(`   URL: ${url}`);
    console.log(`   Response:`, JSON.stringify(response.data, null, 2).substring(0, 500));
    console.log('');
    return response.data;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   URL: ${url}`);
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Error: ${JSON.stringify(error.response?.data)}`);
    console.log('');
    return null;
  }
}

async function testAllEndpoints() {
  console.log('🔍 Testing all possible On-Call API endpoints...\n');

  const now = new Date();
  const later = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const baseUrl = `https://api.${config.site}/api/v2/on-call`;

  // Test various endpoint patterns
  await tryEndpoint(
    '1. Get Schedule',
    `${baseUrl}/schedules/${config.scheduleId}`
  );

  await tryEndpoint(
    '2. Get Schedule with includes',
    `${baseUrl}/schedules/${config.scheduleId}`,
    'GET',
    { 'include[]': ['layers', 'users', 'teams'] }
  );

  await tryEndpoint(
    '3. List all schedules',
    `${baseUrl}/schedules`
  );

  await tryEndpoint(
    '4. Get oncalls',
    `${baseUrl}/oncalls`
  );

  await tryEndpoint(
    '5. Get oncalls with time range',
    `${baseUrl}/oncalls`,
    'GET',
    {
      start: now.toISOString(),
      end: later.toISOString()
    }
  );

  await tryEndpoint(
    '6. Get oncalls for schedule',
    `${baseUrl}/oncalls`,
    'GET',
    {
      schedule_ids: config.scheduleId,
      start: now.toISOString(),
      end: later.toISOString()
    }
  );

  await tryEndpoint(
    '7. Get schedule oncalls',
    `${baseUrl}/schedules/${config.scheduleId}/oncalls`
  );

  await tryEndpoint(
    '8. Get schedule current',
    `${baseUrl}/schedules/${config.scheduleId}/current`
  );

  await tryEndpoint(
    '9. Get schedule shifts',
    `${baseUrl}/schedules/${config.scheduleId}/shifts`,
    'GET',
    {
      start: now.toISOString(),
      end: later.toISOString()
    }
  );

  await tryEndpoint(
    '10. Get shifts',
    `${baseUrl}/shifts`,
    'GET',
    {
      schedule_id: config.scheduleId,
      start: now.toISOString(),
      end: later.toISOString()
    }
  );

  await tryEndpoint(
    '11. Get users oncall',
    `${baseUrl}/users/oncall`
  );

  await tryEndpoint(
    '12. Get teams oncall',
    `${baseUrl}/teams/oncall`
  );

  console.log('✅ Test complete!');
}

testAllEndpoints();
