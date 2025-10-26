require('dotenv').config();
const axios = require('axios');

const config = {
  apiKey: process.env.DATADOG_API_KEY,
  appKey: process.env.DATADOG_APP_KEY,
  site: process.env.DATADOG_SITE || 'datadoghq.eu'
};

async function testDatadog() {
  console.log('🔍 Testing Datadog connection...\n');
  console.log(`Site: ${config.site}`);
  console.log(`API Key: ${config.apiKey.substring(0, 10)}...`);
  console.log(`App Key: ${config.appKey.substring(0, 10)}...\n`);

  try {
    // Test 1: Validate credentials
    console.log('1️⃣ Testing API credentials...');
    const validateUrl = `https://api.${config.site}/api/v1/validate`;
    await axios.get(validateUrl, {
      headers: {
        'DD-API-KEY': config.apiKey,
        'DD-APPLICATION-KEY': config.appKey
      }
    });
    console.log('✅ Credentials are valid!\n');

    // Test 2: Check on-call API
    console.log('2️⃣ Checking on-call schedules...');
    const now = new Date();
    const until = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const oncallUrl = `https://api.${config.site}/api/v2/oncalls`;
    console.log(`   URL: ${oncallUrl}`);

    try {
      const response = await axios.get(oncallUrl, {
        headers: {
          'DD-API-KEY': config.apiKey,
          'DD-APPLICATION-KEY': config.appKey
        },
        params: {
          from: now.toISOString(),
          to: until.toISOString()
        }
      });

      if (response.data && response.data.data) {
        if (response.data.data.length === 0) {
          console.log('⚠️  No on-call schedules found');
          console.log('   This could mean:');
          console.log('   - No on-call schedules are configured in Datadog');
          console.log('   - No one is currently on-call');
          console.log('   - The schedules are outside the query time range\n');
        } else {
          console.log(`✅ Found ${response.data.data.length} on-call schedule(s):\n`);
          response.data.data.forEach((oncall, idx) => {
            const schedule = oncall.attributes?.schedule;
            const user = oncall.attributes?.user;
            console.log(`   ${idx + 1}. Schedule: ${schedule?.name || 'Unknown'}`);
            console.log(`      ID: ${schedule?.id || 'N/A'}`);
            console.log(`      User: ${user?.name || user?.email || 'Unknown'}`);
            console.log('');
          });
        }
      }
    } catch (oncallError) {
      if (oncallError.response?.status === 404) {
        console.log('⚠️  On-Call API returned 404');
        console.log('   This could mean:');
        console.log('   - On-Call feature is not enabled for your Datadog account');
        console.log('   - You need a specific Datadog plan for On-Call');
        console.log('   - The API endpoint might be different\n');
        console.log('   Please check: https://app.datadoghq.eu/on-call/schedules');
      } else {
        throw oncallError;
      }
    }

    // Test 3: Try alternative endpoints
    console.log('3️⃣ Checking if On-Call is available...');
    console.log('   Visit: https://app.datadoghq.eu/on-call/schedules');
    console.log('   If you see "Feature not available", you may need to upgrade your plan\n');

  } catch (error) {
    console.error('❌ Error testing Datadog:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

testDatadog();
