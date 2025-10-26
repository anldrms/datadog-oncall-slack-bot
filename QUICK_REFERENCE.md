# Carlton One On-Call Bot - Quick Reference

## 🚀 Hızlı Deployment

### Local'den VM'ye Tek Komutla Deploy
```bash
cd ~/Desktop/oncall-slack-bot
./deploy-to-vm.sh
```

### VM'de İlk Kurulum
```bash
# VM'ye bağlan
ssh -i your-key.pem ubuntu@vm-ip

# Setup script'i çalıştır
bash vm-setup.sh

# Bot'u başlat
cd ~/oncall-slack-bot
pm2 start index.js --name carlton-oncall-bot -- start
pm2 save
pm2 startup
```

---

## 📋 Sık Kullanılan Komutlar

### Bot Yönetimi
```bash
# Status kontrol
pm2 status

# Log'ları izle
pm2 logs carlton-oncall-bot

# Bot'u restart et
pm2 restart carlton-oncall-bot

# Bot'u durdur
pm2 stop carlton-oncall-bot

# Bot'u başlat
pm2 start carlton-oncall-bot
```

### Kod Güncelleme
```bash
# Local'de yeni kodu paketle
cd ~/Desktop
tar --exclude='node_modules' -czf bot.tar.gz oncall-slack-bot/

# VM'ye transfer et
scp -i key.pem bot.tar.gz ubuntu@vm-ip:~/

# VM'de güncelle
ssh -i key.pem ubuntu@vm-ip
tar -xzf bot.tar.gz
cd oncall-slack-bot
npm install
pm2 restart carlton-oncall-bot
```

### Test Komutları
```bash
# Datadog bağlantısını test et (mesaj göndermez)
node test-connection-only.js

# Slack token'ı test et (mesaj göndermez)
node test-slack-token-only.js

# Gerçek mesaj gönder (TEST - dikkatli kullan!)
npm test
```

---

## 🔧 Troubleshooting

### Bot çalışmıyor
```bash
# Log'lara bak
pm2 logs carlton-oncall-bot --err

# Manuel başlat
cd ~/oncall-slack-bot
node index.js start
```

### Mesajlar gitmiyor
```bash
# Environment variables kontrol
cat .env | grep -v "^#"

# Test scriptlerini çalıştır
node test-connection-only.js
node test-slack-token-only.js
```

### Memory sorunu
```bash
# Memory kullanımını gör
pm2 monit

# Max memory ile restart ayarla
pm2 delete carlton-oncall-bot
pm2 start index.js --name carlton-oncall-bot --max-memory-restart 300M -- start
pm2 save
```

---

## 📅 Scheduled Posts

| Kanal | Zamanlama | Açıklama |
|-------|-----------|----------|
| **c1-oncall-bot** | Her gün 09:00 AM EST | Tüm takımların oncall bilgileri |
| **system-production** | Her Pazartesi 08:00 AM EST | Sadece topic güncelleme |

---

## 🔐 Önemli Dosyalar

- `index.js` - Ana bot kodu
- `.env` - Environment variables (GİZLİ!)
- `post-general-oncall.js` - Tüm takımları gösteren mesaj
- `package.json` - Bağımlılıklar
- `CLOUD_DEPLOYMENT_GUIDE.md` - Detaylı deployment guide

---

## 📊 System Requirements

- **Minimum**: 1 vCPU, 512MB RAM, 10GB disk
- **Önerilen**: 1 vCPU, 1GB RAM, 10GB disk
- **OS**: Ubuntu 20.04+ veya Amazon Linux 2
- **Node.js**: v18+
- **Network**: Outbound HTTPS (443) erişimi

---

## 🆘 Emergency Commands

### Bot tamamen durdu, hemen başlat
```bash
pm2 restart carlton-oncall-bot || pm2 start ~/oncall-slack-bot/index.js --name carlton-oncall-bot -- start
```

### Log dosyası çok büyüdü
```bash
pm2 flush carlton-oncall-bot
```

### VM reboot oldu, bot çalışmıyor
```bash
# PM2 startup komutunu çalıştırdıysanız otomatik başlar
# Manuel kontrol:
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

- [ ] VM oluşturuldu ve erişilebilir
- [ ] `vm-setup.sh` çalıştırıldı
- [ ] Bot kodu transfer edildi
- [ ] `.env` dosyası yapılandırıldı
- [ ] `npm install` tamamlandı
- [ ] Bot PM2 ile başlatıldı
- [ ] `pm2 save` ve `pm2 startup` yapıldı
- [ ] Test mesajları başarılı
- [ ] Log'lar normal görünüyor

---

**Carlton One - System Production Team**
