# Carlton One On-Call Bot - Quick Reference

## 🚀 Quick Deployment

### Deploy from Local to VM in One Command
```bash
cd ~/Desktop/oncall-slack-bot
./deploy-to-vm.sh
```

### First-Time Setup on VM
```bash
# SSH to VM
ssh -i your-key.pem ubuntu@vm-ip

# Run setup script
bash vm-setup.sh

# Start bot
cd ~/oncall-slack-bot
pm2 start index.js --name carlton-oncall-bot -- start
pm2 save
pm2 startup
```

---

## 📋 Frequently Used Commands

### Bot Management
```bash
# Check status
pm2 status

# Watch logs
pm2 logs carlton-oncall-bot

# Restart bot
pm2 restart carlton-oncall-bot

# Stop bot
pm2 stop carlton-oncall-bot

# Start bot
pm2 start carlton-oncall-bot
```

### Code Updates
```bash
# Package new code locally
cd ~/Desktop
tar --exclude='node_modules' -czf bot.tar.gz oncall-slack-bot/

# Transfer to VM
scp -i key.pem bot.tar.gz ubuntu@vm-ip:~/

# Update on VM
ssh -i key.pem ubuntu@vm-ip
tar -xzf bot.tar.gz
cd oncall-slack-bot
npm install
pm2 restart carlton-oncall-bot
```

### Test Commands
```bash
# Test Datadog connection (no messages sent)
node test-connection-only.js

# Test Slack token (no messages sent)
node test-slack-token-only.js

# Send real message (TEST - use carefully!)
npm test
```

---

## 🔧 Troubleshooting

### Bot not working
```bash
# Check error logs
pm2 logs carlton-oncall-bot --err

# Start manually
cd ~/oncall-slack-bot
node index.js start
```

### Messages not being sent
```bash
# Check environment variables
cat .env | grep -v "^#"

# Run test scripts
node test-connection-only.js
node test-slack-token-only.js
```

### Memory issues
```bash
# Check memory usage
pm2 monit

# Set max memory restart
pm2 delete carlton-oncall-bot
pm2 start index.js --name carlton-oncall-bot --max-memory-restart 300M -- start
pm2 save
```

---

## 📅 Scheduled Posts

| Channel | Schedule | Description |
|---------|----------|-------------|
| **c1-oncall-bot** | Every day 09:00 AM EST | All teams on-call information |
| **system-production** | Every Monday 08:00 AM EST | Topic update only |

---

## 🔐 Important Files

- `index.js` - Main bot code
- `.env` - Environment variables (SECRET!)
- `post-general-oncall.js` - All teams message
- `package.json` - Dependencies
- `CLOUD_DEPLOYMENT_GUIDE.md` - Detailed deployment guide

---

## 📊 System Requirements

- **Minimum**: 1 vCPU, 512MB RAM, 10GB disk
- **Recommended**: 1 vCPU, 1GB RAM, 10GB disk
- **OS**: Ubuntu 20.04+ or Amazon Linux 2
- **Node.js**: v18+
- **Network**: Outbound HTTPS (443) access

---

## 🆘 Emergency Commands

### Bot completely stopped, start immediately
```bash
pm2 restart carlton-oncall-bot || pm2 start ~/oncall-slack-bot/index.js --name carlton-oncall-bot -- start
```

### Log file too large
```bash
pm2 flush carlton-oncall-bot
```

### VM rebooted, bot not running
```bash
# If you ran pm2 startup, it should auto-start
# Manual check:
pm2 resurrect
pm2 list
```

---

## 📞 Contact

- **Datadog Console**: https://app.datadoghq.eu/on-call/schedules
- **Slack Workspace**: Carlton One
- **Bitbucket**: ssh://git@bitbucket.util.carlton.ca:7999/sys/datadog-on-call-slack-bot.git

---

## 🎯 Deployment Checklist

- [ ] VM created and accessible
- [ ] `vm-setup.sh` executed
- [ ] Bot code transferred
- [ ] `.env` file configured
- [ ] `npm install` completed
- [ ] Bot started with PM2
- [ ] `pm2 save` and `pm2 startup` done
- [ ] Test messages successful
- [ ] Logs look normal

---

**Carlton One - System Production Team**
