# Carlton One System Production - Production Deployment Checklist

## ✅ What's Already Done

1. **Bot Code** - Fully functional and tested
2. **Datadog Integration** - Connected and working
3. **Carlton One Branding** - Professional messaging
4. **System Production Configuration** - Schedule configured
5. **Message Formatting** - Carlton One branded with support info
6. **Channel Topic Updates** - Code ready (needs Slack scope)
7. **Message Pinning** - Working
8. **Scheduled Posts** - Configured for 9 AM EST daily

## 📋 Tomorrow's Tasks - Before Going Live

### 1. Update Slack App Permissions

**Go to**: https://api.slack.com/apps/A09NQDZFEUR/oauth

**Add this scope**:
- ✅ Already have: `chat:write`
- ✅ Already have: `chat:write.public`
- ✅ Already have: `pins:write`
- ✅ Already have: `channels:read`
- ✅ Already have: `groups:read`
- ⭐ **NEED TO ADD**: `channels:manage` (for topic updates)

**Steps**:
1. Scroll to "Bot Token Scopes"
2. Click "Add an OAuth Scope"
3. Add `channels:manage`
4. Click "Reinstall to Workspace"
5. Authorize the changes
6. Copy the NEW Bot User OAuth Token (xoxb-...)

### 2. Get Production Slack Channel ID

**Find the System Production channel in Carlton One Slack**:
1. Right-click the channel
2. "View channel details"
3. Copy the Channel ID from the bottom
4. It will look like: `C0XXXXXXXXX`

### 3. Update Production Configuration

Edit `/Users/anil.durmus/Desktop/oncall-slack-bot/.env`:

```env
# Update with NEW token from step 1
SLACK_BOT_TOKEN=xoxb-NEW-TOKEN-HERE

# Update with Channel ID from step 2
SLACK_CHANNEL_ID=C0XXXXXXXXX
```

### 4. Test on Production Channel

```bash
npm test
```

**Expected output**:
```
✅ Message posted successfully!
✅ Channel topic updated!
✅ Message pinned successfully!
✅ Done!
```

**Check in Slack**:
- [ ] Message posted with Carlton One branding
- [ ] Channel topic shows on-call engineer
- [ ] Message is pinned
- [ ] Engineer name and shift times are correct
- [ ] All formatting looks professional

### 5. Deploy to Production

**Option A: Run as Service (PM2 - Recommended)**

```bash
cd /Users/anil.durmus/Desktop/oncall-slack-bot
npm install -g pm2
pm2 start index.js --name carlton-oncall-bot
pm2 save
pm2 startup
```

**Option B: Run in Screen/Tmux**

```bash
cd /Users/anil.durmus/Desktop/oncall-slack-bot
screen -S oncall-bot
npm start
# Press Ctrl+A, then D to detach
```

**Option C: Deploy to Server**

Copy the entire directory to your production server and run with PM2.

### 6. Verify Scheduled Posts

The bot is configured to post at **9 AM EST every day**.

**First scheduled post**: Tomorrow at 9:00 AM EST

**To change schedule**, edit `.env`:
```env
# Every weekday at 9 AM
CRON_SCHEDULE=0 9 * * 1-5

# Twice daily (9 AM and 5 PM)
CRON_SCHEDULE=0 9,17 * * *
```

### 7. Monitor

**Check logs**:
```bash
pm2 logs carlton-oncall-bot
```

**Check status**:
```bash
pm2 status
```

**Restart if needed**:
```bash
pm2 restart carlton-oncall-bot
```

## 🔧 Current Configuration

### Datadog
- **Schedule**: ⚙️ Infrastructure (System Production)
- **Schedule ID**: `0c5b7058-8bcf-4e97-84ff-1c1af71c0606`
- **Timezone**: America/Toronto (EST)
- **Site**: datadoghq.eu

### Slack (Needs Update)
- **App**: Oncall Bot (A09NQDZFEUR)
- **Token**: ⚠️ Needs new token after adding scope
- **Channel**: ⚠️ Needs production channel ID
- **Workspace**: Carlton One

### Schedule
- **Frequency**: Daily at 9 AM EST
- **Cron**: `0 9 * * *`
- **Timezone**: America/Toronto

## 📊 Message Preview

The bot will post:

```
🔧 Carlton One - System Production On-Call
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current On-Call Engineer for System Production Team

📋 Schedule: ⚙️ Infrastructure
👤 On-Call Engineer: [Name from Datadog]
📧 Email: [Email from Datadog]
⏰ Shift: [Start] - [End] EST

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Need Support?
• For urgent issues, contact the on-call engineer directly
• For non-urgent matters, create a ticket in ServiceNow
• Emergency escalation: Follow the incident response protocol

🏢 Carlton One - System Production Team | Updated: [Timestamp] EST
```

**Channel Topic**:
```
🔧 Carlton One - System Production | 👤 On-Call: [Name] | Shift: [Times] EST
```

## 🚨 Troubleshooting

### If topic update fails
- Make sure `channels:manage` scope is added
- Reinstall the Slack app
- For private channels: `/invite @oncall_bot`

### If posting fails
- Check bot token is correct
- Verify channel ID is correct
- Ensure bot is in the channel (for private channels)

### If times are wrong
- Bot is configured for EST (America/Toronto)
- All times from Datadog are converted to EST

### If wrong schedule
- Verify `DATADOG_SCHEDULE_ID` in `.env`
- Run `node list-schedules.js` to see all available schedules

## 📞 Support

- **Code Repository**: ssh://git@bitbucket.util.carlton.ca:7999/sys/datadog-on-call-slack-bot.git
- **Datadog Dashboard**: https://app.datadoghq.eu/on-call/schedules
- **Slack App Config**: https://api.slack.com/apps/A09NQDZFEUR

## 🎯 Success Criteria

- [ ] Bot posts at 9 AM EST daily
- [ ] Channel topic updates automatically
- [ ] Messages show correct on-call engineer
- [ ] Shift times are in EST
- [ ] Messages are pinned
- [ ] Carlton One branding is consistent
- [ ] Team can see who's on-call at a glance

---

**Ready for production deployment tomorrow!** 🚀

Just complete the checklist above and the bot will be live for Carlton One System Production team.
