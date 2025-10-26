# Carlton One On-Call Bot - Cloud VM Deployment Guide

> **Note**: This bot has been successfully deployed to AWS (35.183.112.68). This guide is for reference or redeployment.

## 📋 Requirements

- Cloud VM (AWS EC2, Azure VM, or GCP Compute Engine)
- OS: Ubuntu 20.04+ or Amazon Linux 2
- Minimum: 1 vCPU, 512MB RAM, 10GB disk
- Node.js 18+
- PM2 (process manager)
- SSH access

---

## 🚀 Quick Deployment (15 minutes)

### Option A: Automatic Deployment (Recommended)

From your local machine:
```bash
cd ~/Desktop/oncall-slack-bot
./deploy-to-vm.sh
```

The script will:
1. Package the bot code
2. Transfer to VM via SCP
3. Extract and install dependencies
4. Guide you through PM2 setup

### Option B: Manual Deployment

#### 1. Prepare Cloud VM

**Create VM with:**
- Ubuntu 20.04 or Amazon Linux 2
- 1 vCPU, 512MB-1GB RAM
- Public IP address
- SSH key pair
- Security Group: Allow SSH (port 22)

**Connect via SSH:**
```bash
ssh -i your-key.pem ubuntu@vm-ip
```

#### 2. Install Node.js on VM

**For Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should show v18.x.x
```

**For Amazon Linux 2:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### 3. Transfer Bot Code to VM

**From local machine:**
```bash
cd ~/Desktop
tar --exclude='node_modules' --exclude='.git' -czf bot.tar.gz oncall-slack-bot/
scp -i key.pem bot.tar.gz ubuntu@vm-ip:~/
```

**On VM:**
```bash
tar -xzf bot.tar.gz
cd oncall-slack-bot
npm install --production
```

#### 4. Configure Environment

Verify `.env` file has correct values:
```bash
cat .env | grep -v "^#"
```

Required variables:
- `DATADOG_API_KEY`
- `DATADOG_APP_KEY`
- `SLACK_BOT_TOKEN`
- `SLACK_CHANNEL_1_ID` (c1-oncall-bot)
- `SLACK_CHANNEL_2_ID` (system-production)

#### 5. Install PM2 and Start Bot

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start bot
cd ~/oncall-slack-bot
pm2 start index.js --name carlton-oncall-bot -- start

# Save PM2 configuration
pm2 save

# Enable auto-start on boot
pm2 startup
# Follow the command it provides (run with sudo)
```

#### 6. Verify Deployment

```bash
# Check bot status
pm2 status

# Watch logs
pm2 logs carlton-oncall-bot

# Should see:
# ✅ Bot is running! Waiting for scheduled posts...
```

---

## 🔧 Bot Management

### Status and Logs
```bash
pm2 status                      # Check if bot is running
pm2 logs carlton-oncall-bot     # View logs (live)
pm2 logs carlton-oncall-bot --lines 100  # Last 100 lines
pm2 logs carlton-oncall-bot --err        # Errors only
```

### Start/Stop/Restart
```bash
pm2 restart carlton-oncall-bot  # Restart bot
pm2 stop carlton-oncall-bot     # Stop bot
pm2 start carlton-oncall-bot    # Start bot
pm2 delete carlton-oncall-bot   # Remove from PM2
```

### Update Bot Code
```bash
# On local machine
cd ~/Desktop
tar --exclude='node_modules' -czf bot.tar.gz oncall-slack-bot/
scp -i key.pem bot.tar.gz ubuntu@vm-ip:~/

# On VM
tar -xzf bot.tar.gz
cd oncall-slack-bot
npm install
pm2 restart carlton-oncall-bot
```

---

## 📊 Configuration

### Multi-Channel Setup

The bot posts to two channels with different schedules:

**Channel 1: c1-oncall-bot**
- Schedule: Every day at 9:00 AM EST
- Mode: `general-all-teams`
- Shows: ALL teams' on-call information
- Cron: `0 9 * * *`

**Channel 2: system-production**
- Schedule: Every Monday at 8:00 AM EST
- Mode: `topic-only`
- Updates: Channel topic with Infrastructure on-call
- Cron: `0 8 * * 1`

### Timezone

Bot uses `America/Toronto` timezone (EST/EDT).
Configured in `index.js` lines 414-416 and 434-436.

---

## 🧪 Testing

### Test Without Sending Messages

```bash
# Test Datadog API connection
node test-connection-only.js

# Test Slack bot token
node test-slack-token-only.js
```

### Send Test Message (Real Post to Slack!)

```bash
npm test
# or
node index.js now
```

**Warning**: This will actually post to configured Slack channels!

---

## 🔐 Security

### Protect Sensitive Files
```bash
chmod 600 .env
chmod 700 ~/.ssh
```

### Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw enable
```

### Auto Security Updates
```bash
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 🆘 Troubleshooting

### Bot Not Running
```bash
# Check PM2 status
pm2 status

# View error logs
pm2 logs carlton-oncall-bot --err

# Try manual start
cd ~/oncall-slack-bot
node index.js start
```

### Messages Not Being Sent

**Check Datadog Connection:**
```bash
node test-connection-only.js
```

**Check Slack Token:**
```bash
node test-slack-token-only.js
```

**Check Environment Variables:**
```bash
cat .env | grep -E "DATADOG|SLACK"
```

### Bot Keeps Restarting

```bash
# Check memory usage
pm2 monit

# Set memory limit
pm2 delete carlton-oncall-bot
pm2 start index.js --name carlton-oncall-bot --max-memory-restart 300M -- start
pm2 save
```

### Wrong Timezone

```bash
# Check system timezone
timedatectl

# Set to EST
sudo timedatectl set-timezone America/Toronto
```

### After VM Reboot

If PM2 startup was configured, bot should auto-start.

```bash
# Check if running
pm2 list

# If not running
pm2 resurrect
```

---

## 📅 Scheduled Execution

Bot waits for cron schedule times and automatically posts:

| Time | Channel | Action |
|------|---------|--------|
| 09:00 AM EST daily | c1-oncall-bot | Post all teams' on-call info |
| 08:00 AM EST Monday | system-production | Update topic with Infrastructure on-call |

**Timezone**: America/Toronto (handles EST/EDT automatically)

---

## 📈 Monitoring

### PM2 Monitoring
```bash
pm2 monit  # Real-time monitoring
pm2 logs carlton-oncall-bot  # Watch logs
```

### Check Successful Posts

Bot logs successful posts:
```
✅ Message posted successfully!
✅ Channel topic updated!
```

Look for errors:
```bash
pm2 logs carlton-oncall-bot --err
```

---

## 🔄 Backup and Recovery

### Backup Configuration
```bash
# Backup .env file
cp .env .env.backup

# Backup entire bot directory
cd ~
tar -czf oncall-bot-backup-$(date +%Y%m%d).tar.gz oncall-slack-bot/
```

### Recovery
```bash
# Restore from backup
tar -xzf oncall-bot-backup-YYYYMMDD.tar.gz
cd oncall-slack-bot
npm install
pm2 restart carlton-oncall-bot
```

---

## 📞 Support

- **Datadog Console**: https://app.datadoghq.eu/on-call/schedules
- **Slack Workspace**: Carlton One
- **Repository**: ssh://git@bitbucket.util.carlton.ca:7999/sys/datadog-on-call-slack-bot.git
- **Current Deployment**: AWS EC2 35.183.112.68

---

## ✅ Deployment Checklist

- [ ] Cloud VM created and accessible
- [ ] Node.js 18+ installed
- [ ] PM2 installed globally
- [ ] Bot code transferred and extracted
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured correctly
- [ ] Bot started with PM2
- [ ] PM2 configuration saved (`pm2 save`)
- [ ] Auto-start enabled (`pm2 startup`)
- [ ] Logs show bot is running
- [ ] Test connections successful
- [ ] Waiting for next scheduled post

---

**Carlton One - System Production Team**
*Cloud Deployment Guide v2.0*
*Last Updated: 2025-10-25*
