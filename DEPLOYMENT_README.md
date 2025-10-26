# 🚀 Carlton One On-Call Bot - Deployment Özeti

## Mevcut Durum

✅ **Bot hazır ve test edildi**
✅ **Timezone sorunu düzeltildi** (America/Toronto)
✅ **2 kanal yapılandırıldı**:
  - `c1-oncall-bot` - Her gün 09:00 AM EST (tüm takımlar)
  - `system-production` - Her Pazartesi 08:00 AM EST (sadece topic)

## 🎯 Yapılması Gerekenler

### 1️⃣ Cloud VM Hazırla
- AWS EC2, Azure VM, veya GCP Compute Engine
- Minimum: 1 vCPU, 512MB RAM
- Ubuntu 20.04+ veya Amazon Linux 2
- SSH erişimi

### 2️⃣ Deployment Yap

**Seçenek A: Otomatik Deployment (Önerilen)**
```bash
cd ~/Desktop/oncall-slack-bot
./deploy-to-vm.sh
```
Script size rehberlik edecek.

**Seçenek B: Manuel Deployment**
Detaylı adımlar için: `CLOUD_DEPLOYMENT_GUIDE.md`

### 3️⃣ VM'de Bot'u Başlat
```bash
# VM'ye SSH ile bağlan
ssh -i your-key.pem ubuntu@your-vm-ip

# İlk kurulum (bir kez)
bash vm-setup.sh

# Bot'u başlat
cd ~/oncall-slack-bot
pm2 start index.js --name carlton-oncall-bot -- start
pm2 save
pm2 startup
```

### 4️⃣ Doğrula
```bash
# Log'ları kontrol et
pm2 logs carlton-oncall-bot

# Beklenen çıktı:
# ✅ Bot is running! Waiting for scheduled posts...
```

## 📚 Dokümantasyon

| Dosya | Açıklama |
|-------|----------|
| **CLOUD_DEPLOYMENT_GUIDE.md** | Detaylı deployment rehberi (15 dakika) |
| **QUICK_REFERENCE.md** | Hızlı komut referansı |
| **deploy-to-vm.sh** | Otomatik deployment scripti |
| **vm-setup.sh** | VM initial setup scripti |

## 🧪 Test Scriptleri

Deployment öncesi test için:

```bash
# Datadog API bağlantısını test et (mesaj göndermez)
node test-connection-only.js

# Slack bot token'ı test et (mesaj göndermez)
node test-slack-token-only.js
```

## ⚡ Hızlı Başlangıç

```bash
# 1. Local'den deployment scripti çalıştır
./deploy-to-vm.sh

# 2. VM'de kurulumu tamamla
ssh -i key.pem ubuntu@vm-ip
bash vm-setup.sh
cd oncall-slack-bot
pm2 start index.js --name carlton-oncall-bot -- start
pm2 save
pm2 startup

# 3. Log'ları izle
pm2 logs carlton-oncall-bot
```

## 🎉 İşte Bu Kadar!

Bot artık cloud'da 7/24 çalışacak ve zamanlanmış saatlerde otomatik mesaj gönderecek.

### Sonraki Scheduled Posts:
- **c1-oncall-bot**: Bir sonraki gün 09:00 AM EST
- **system-production**: Bir sonraki Pazartesi 08:00 AM EST

## 🆘 Sorun mu var?

1. `QUICK_REFERENCE.md` - Hızlı komutlar
2. `CLOUD_DEPLOYMENT_GUIDE.md` - Detaylı troubleshooting
3. Log'lara bak: `pm2 logs carlton-oncall-bot`

---

**Carlton One - System Production Team**
*On-Call Bot - Production Ready*
