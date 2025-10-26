# 🚀 Carlton One On-Call Bot - Deployment Summary

## Current Status

✅ **Bot is ready and tested**
✅ **Timezone issue fixed** (America/Toronto)
✅ **2 channels configured**:
  - `c1-oncall-bot` - Every day at 09:00 AM EST (all teams)
  - `system-production` - Every Monday at 08:00 AM EST (topic only)

## 🎯 What Needs to Be Done

### 1️⃣ Prepare Cloud VM
- AWS EC2, Azure VM, or GCP Compute Engine
- Minimum: 1 vCPU, 512MB RAM
- Ubuntu 20.04+ or Amazon Linux 2
- SSH access

### 2️⃣ Deploy

**Option A: Automatic Deployment (Recommended)**
```bash
cd ~/Desktop/oncall-slack-bot
./deploy-to-vm.sh
```
The script will guide you through the process.

**Option B: Manual Deployment**
See `CLOUD_DEPLOYMENT_GUIDE.md` for detailed steps.

### 3️⃣ Start Bot on VM
```bash
# SSH to VM
ssh -i your-key.pem ubuntu@your-vm-ip

# Initial setup (one time)
bash vm-setup.sh

# Start bot
cd ~/oncall-slack-bot
pm2 start index.js --name carlton-oncall-bot -- start
pm2 save
pm2 startup
```

### 4️⃣ Verify
```bash
# Check logs
pm2 logs carlton-oncall-bot

# Expected output:
# ✅ Bot is running! Waiting for scheduled posts...
```

## 📚 Documentation

| File | Description |
|------|-------------|
| **CLOUD_DEPLOYMENT_GUIDE.md** | Detailed deployment guide (15 minutes) |
| **QUICK_REFERENCE.md** | Quick command reference |
| **deploy-to-vm.sh** | Automatic deployment script |
| **vm-setup.sh** | VM initial setup script |

## 🧪 Test Scripts

Test before deployment:

```bash
# Test Datadog API connection (no messages sent)
node test-connection-only.js

# Test Slack bot token (no messages sent)
node test-slack-token-only.js
```

## ⚡ Quick Start

```bash
# 1. Run deployment script from local
./deploy-to-vm.sh

# 2. Complete setup on VM
ssh -i key.pem ubuntu@vm-ip
bash vm-setup.sh
cd oncall-slack-bot
pm2 start index.js --name carlton-oncall-bot -- start
pm2 save
pm2 startup

# 3. Monitor logs
pm2 logs carlton-oncall-bot
```

## 🎉 That's It!

Bot will now run 24/7 in the cloud and send messages at scheduled times.

### Next Scheduled Posts:
- **c1-oncall-bot**: Next day at 09:00 AM EST
- **system-production**: Next Monday at 08:00 AM EST

## 🆘 Need Help?

1. `QUICK_REFERENCE.md` - Quick commands
2. `CLOUD_DEPLOYMENT_GUIDE.md` - Detailed troubleshooting
3. Check logs: `pm2 logs carlton-oncall-bot`

---

**Carlton One - System Production Team**
*On-Call Bot - Production Ready*
