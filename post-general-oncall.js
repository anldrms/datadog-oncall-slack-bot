const axios = require('axios');
const { WebClient } = require('@slack/web-api');
require('dotenv').config();

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

const SCHEDULES = [
  { id: '3ef5863f-d48e-4ef1-8557-1176b39d5ffb', name: 'TSA – 24x7', emoji: '🚨', isTSA: true },
  { id: '0c5b7058-8bcf-4e97-84ff-1c1af71c0606', name: '⚙️ Infrastructure', emoji: '🛠️', priority: 1 },
  { id: '7265d336-dad2-4c41-9a41-e8838720bbf6', name: 'Deployment', emoji: '🚀' },
  { id: 'fe6afe30-d73a-4088-ab49-b9ac6170d1e8', name: 'GRS Developers', emoji: '💻' },
  { id: '109a8757-a4f1-44d6-9bd3-1f8114ace7ed', name: 'P2M Developers', emoji: '📱' },
  { id: '6da40953-1817-47ca-a46d-63634d2fd475', name: 'P2M Senior Developers', emoji: '👨‍💻' },
  { id: '3a3caea4-e8f5-48ed-a23c-ffb9feff5e64', name: 'Management', emoji: '👔' },
  { id: '4d4a11d0-c9f3-4f97-b9bd-a29aecf606ef', name: 'Cybage - Team Schedule', emoji: '🌐' }
];

async function getUserInfo(userId) {
  try {
    const url = `https://api.${process.env.DATADOG_SITE}/api/v2/users/${userId}`;
    const response = await axios.get(url, {
      headers: {
        'DD-API-KEY': process.env.DATADOG_API_KEY,
        'DD-APPLICATION-KEY': process.env.DATADOG_APP_KEY
      }
    });
    const userData = response.data.data?.attributes;
    return {
      name: userData?.name || 'Unknown',
      email: userData?.email || null
    };
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error.message);
    return { name: 'Unknown', email: null };
  }
}

async function getSlackUserId(email) {
  if (!email) return null;

  try {
    const result = await slack.users.lookupByEmail({ email });
    return result.user?.id || null;
  } catch (error) {
    // User not found in Slack, that's okay
    return null;
  }
}

async function getOnCallForSchedule(scheduleId) {
  try {
    const url = `https://api.${process.env.DATADOG_SITE}/api/v2/on-call/schedules/${scheduleId}/on-call`;
    const response = await axios.get(url, {
      headers: {
        'DD-API-KEY': process.env.DATADOG_API_KEY,
        'DD-APPLICATION-KEY': process.env.DATADOG_APP_KEY
      }
    });

    const onCallData = response.data.data;

    if (!onCallData) {
      return null;
    }

    // Get user ID from relationships
    const userId = onCallData.relationships?.user?.data?.id;
    if (!userId) {
      return null;
    }

    // Fetch user info
    const userInfo = await getUserInfo(userId);
    const slackUserId = await getSlackUserId(userInfo.email);

    return [{
      name: userInfo.name,
      email: userInfo.email,
      slackUserId: slackUserId,
      shiftStart: onCallData.attributes?.start,
      shiftEnd: onCallData.attributes?.end
    }];

  } catch (error) {
    console.error(`Error fetching ${scheduleId}:`, error.message);
    return null;
  }
}

async function postGeneralOnCall() {
  console.log('🔍 Fetching all on-call information...\n');

  const scheduleData = [];

  for (const schedule of SCHEDULES) {
    const onCallUsers = await getOnCallForSchedule(schedule.id);
    scheduleData.push({
      ...schedule,
      onCallUsers
    });

    if (onCallUsers) {
      const names = onCallUsers.map(u => u.name).join(', ');
      console.log(`✅ ${schedule.name}: ${names}`);
    } else {
      console.log(`⚪ ${schedule.name}: No one on-call`);
    }
  }

  // Helper function to format user mention
  const formatUser = (user) => {
    if (user.slackUserId) {
      return `<@${user.slackUserId}>`;
    }
    return user.name;
  };

  const formatShiftTime = (shiftEnd) => {
    if (!shiftEnd) return '';
    const endDate = new Date(shiftEnd);
    const estTime = endDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
      timeZoneName: 'short'
    });
    return ` _until ${estTime}_`;
  };

  // Format message
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York'
  });

  // TSA first (highlighted)
  const tsaSchedule = scheduleData.find(s => s.isTSA);

  // Rest of schedules (sorted by priority, then alphabetically)
  const otherSchedules = scheduleData
    .filter(s => !s.isTSA)
    .sort((a, b) => {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return a.name.localeCompare(b.name);
    });

  console.log('\n📨 Posting to Slack...\n');

  // Build blocks
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🚨 Who\'s On-Call Today?',
        emoji: true
      }
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `📅 *${dateStr}*`
        }
      ]
    }
  ];

  // TSA Section (Priority Alert)
  if (tsaSchedule && tsaSchedule.onCallUsers && tsaSchedule.onCallUsers.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${tsaSchedule.emoji} *${tsaSchedule.name}* ⭐\n${tsaSchedule.onCallUsers.map(u => `🔹 ${formatUser(u)}${formatShiftTime(u.shiftEnd)}`).join('\n')}`
      }
    });
    blocks.push({ type: 'divider' });
  }

  // Other schedules - build text
  const scheduleLines = [];
  otherSchedules.forEach(schedule => {
    if (schedule.onCallUsers && schedule.onCallUsers.length > 0) {
      const userList = schedule.onCallUsers.map(u => `${formatUser(u)}${formatShiftTime(u.shiftEnd)}`).join(', ');
      scheduleLines.push(`${schedule.emoji} *${schedule.name}*\n      ${userList}`);
    } else {
      scheduleLines.push(`${schedule.emoji} *${schedule.name}*\n      _No one scheduled_`);
    }
  });

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: scheduleLines.join('\n\n')
    }
  });

  blocks.push({ type: 'divider' });

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: '🤖 _Auto-updated daily at 9:00 AM EST_ | 🏢 *Carlton One*'
      }
    ]
  });

  // Post to Slack
  try {
    const result = await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      text: `On-Call Schedule - ${dateStr}`,
      blocks: blocks,
      unfurl_links: false,
      unfurl_media: false
    });

    console.log('✅ Message posted to Slack!');
    console.log(`Message TS: ${result.ts}`);

    // Pin the message
    try {
      await slack.pins.add({
        channel: process.env.SLACK_CHANNEL_ID,
        timestamp: result.ts
      });
      console.log('📌 Message pinned!');
    } catch (pinError) {
      console.error('⚠️  Could not pin message:', pinError.message);
    }

  } catch (error) {
    console.error('❌ Error posting to Slack:', error.message);
  }
}

postGeneralOnCall();
