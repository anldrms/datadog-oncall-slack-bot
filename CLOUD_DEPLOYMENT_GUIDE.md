# Carlton One On-Call Bot - Cloud VM Deployment Guide

## 📋 Gereksinimler

- Cloud VM (AWS EC2, Azure VM, veya GCP Compute Engine)
- OS: Ubuntu 20.04+ veya Amazon Linux 2
- Node.js 18+
- PM2 (process manager)
- Git (isteğe bağlı)

---

## 🚀 Hızlı Deployment (15 dakika)

### 1. Cloud VM Hazırlığı

**Minimum VM Özellikleri:**
- CPU: 1 vCPU
- RAM: 512 MB (1 GB önerilen)
- Disk: 10 GB
- Network: Public IP + SSH erişimi
- Security Group: Sadece SSH (22) portuna ihtiyaç var (bot outbound connection kullanır)

**VM Oluşturduktan Sonra SSH ile Bağlan:**
```bash
ssh -i your-key.pem ubuntu@your-vm-ip
```

---

### 2. VM'de Node.js Kurulumu

**Ubuntu/Debian için:**
```bash
# Node.js 18.x kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kurulumu doğrula
node --version  # v18.x.x görmeli
npm --version   # 9.x.x veya üstü görmeli
```

**Amazon Linux 2 için:**
```bash
# Node.js 18.x kurulumu
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Kurulumu doğrula
node --version
npm --version
```

---

### 3. Bot Kodunu VM'ye Transfer Et

**Seçenek A: SCP ile Transfer (Önerilen)**

Local makinende (Mac):
```bash
cd ~/Desktop
tar -czf oncall-slack-bot.tar.gz oncall-slack-bot/
scp -i your-key.pem oncall-slack-bot.tar.gz ubuntu@your-vm-ip:~/
```

VM'de:
```bash
tar -xzf oncall-slack-bot.tar.gz
cd oncall-slack-bot
```

**Seçenek B: Git ile (Eğer Bitbucket'ta varsa)**
```bash
cd ~
git clone ssh://git@bitbucket.util.carlton.ca:7999/sys/datadog-on-call-slack-bot.git
cd datadog-on-call-slack-bot
```

**Seçenek C: Manuel Dosya Kopyalama**
```bash
# VM'de klasör oluştur
mkdir -p ~/oncall-slack-bot
cd ~/oncall-slack-bot

# Gerekli dosyaları local'den kopyala
# (Her dosyayı scp ile ayrı ayrı kopyalayın)
```

---

### 4. Bağımlılıkları Yükle

```bash
cd ~/oncall-slack-bot
npm install
```

**Beklenen çıktı:**
```
added 150 packages in 15s
```

---

### 5. Environment Variables Ayarla

`.env` dosyasının doğru yapılandırıldığından emin ol:

```bash
cat .env
```

**Kontrol listesi:**
- ✅ `DATADOG_API_KEY` dolu mu?
- ✅ `DATADOG_APP_KEY` dolu mu?
- ✅ `SLACK_BOT_TOKEN` dolu mu?
- ✅ `SLACK_CHANNEL_1_ID` dolu mu? (c1-oncall-bot kanalı)
- ✅ `SLACK_CHANNEL_2_ID` dolu mu? (system-production kanalı)

Eğer düzenleme gerekiyorsa:
```bash
nano .env
# Düzenle, kaydet (Ctrl+O, Enter, Ctrl+X)
```

---

### 6. Test Et (İSTEĞE BAĞLI - Slack'e mesaj gönderir!)

```bash
npm test
```

**NOT:** Bu komut gerçekten Slack kanallarına mesaj gönderir. Atlamak isterseniz direkt 7. adıma geç.

---

### 7. PM2 Kurulumu ve Bot'u Başlat

**PM2 Global Kurulum:**
```bash
sudo npm install -g pm2
```

**Bot'u PM2 ile Başlat:**
```bash
cd ~/oncall-slack-bot
pm2 start index.js --name carlton-oncall-bot -- start
```

**Başarılı çıktı:**
```
[PM2] Starting index.js in fork_mode (1 instance)
[PM2] Done.
┌────┬────────────────────────┬─────────┬─────────┐
│ id │ name                   │ status  │ restart │
├────┼────────────────────────┼─────────┼─────────┤
│ 0  │ carlton-oncall-bot     │ online  │ 0       │
└────┴────────────────────────┴─────────┴─────────┘
```

**Bot Log'larını Kontrol Et:**
```bash
pm2 logs carlton-oncall-bot
```

Beklenen çıktı:
```
🤖 On-Call Slack Bot starting...
📌 Pin messages: true

📢 Multi-channel mode: 2 channels configured

Channel 1: c1-oncall-bot
  📍 Channel ID: C09MWB138J3
  📅 Schedule: 0 9 * * *
  🎯 Datadog Schedule: 0c5b7058-8bcf-4e97-84ff-1c1af71c0606

Channel 2: system-production
  📍 Channel ID: GDP0JSA4Q
  📅 Schedule: 0 8 * * 1
  🎯 Datadog Schedule: 0c5b7058-8bcf-4e97-84ff-1c1af71c0606

✅ Bot is running! Waiting for scheduled posts...
```

**Log'lardan çık:** `Ctrl+C`

---

### 8. Bot'u Otomatik Başlatma (System Reboot'ta)

```bash
pm2 save
pm2 startup
```

`pm2 startup` komutu size bir komut verecek, onu sudo ile çalıştır:
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

**Doğrulama:**
```bash
pm2 list
```

---

## 🔧 Bot Yönetimi Komutları

### Bot Durumunu Kontrol Et
```bash
pm2 status
pm2 list
```

### Log'ları İzle
```bash
# Tüm log'lar (live)
pm2 logs carlton-oncall-bot

# Sadece son 50 satır
pm2 logs carlton-oncall-bot --lines 50

# Hataları göster
pm2 logs carlton-oncall-bot --err
```

### Bot'u Durdur
```bash
pm2 stop carlton-oncall-bot
```

### Bot'u Yeniden Başlat
```bash
pm2 restart carlton-oncall-bot
```

### Bot'u Sil (PM2'den kaldır)
```bash
pm2 delete carlton-oncall-bot
```

### Bot'u Yeniden Yükle (kod değişikliği sonrası)
```bash
# Yeni kodu transfer et
cd ~/oncall-slack-bot

# Bağımlılıkları güncelle
npm install

# Bot'u yeniden başlat
pm2 restart carlton-oncall-bot
```

---

## 📊 Monitoring ve Troubleshooting

### Bot Çalışıyor mu?
```bash
pm2 status carlton-oncall-bot
```

**Beklenen:**
- Status: `online` ✅
- Uptime: Çalışma süresi
- Restart: Düşükse iyi (sürekli restart oluyorsa sorun var)

### Bot Neden Restart Oluyor?

```bash
pm2 logs carlton-oncall-bot --err
```

**Yaygın hatalar:**
- `Missing required configuration`: `.env` dosyası eksik/yanlış
- `Error fetching on-call data`: Datadog API key hatalı
- `Error posting to Slack`: Slack token hatalı veya bot davet edilmemiş

### Disk Doldu mu?
```bash
df -h
```

### Memory Kullanımı
```bash
pm2 monit
```

---

## 🔐 Güvenlik Önerileri

### 1. .env Dosyası İzinleri
```bash
chmod 600 ~/.env
```

### 2. SSH Key-based Authentication
Şifre ile login'i kapat, sadece SSH key kullan.

### 3. Firewall Ayarları
```bash
sudo ufw allow 22/tcp
sudo ufw enable
```

### 4. Otomatik Güvenlik Güncellemeleri
```bash
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 📅 Zamanlama Bilgileri

Bot şu zamanlarda otomatik mesaj gönderir:

| Kanal | Zamanlama | Ne Yapar |
|-------|-----------|----------|
| **c1-oncall-bot** | Her gün 09:00 AM EST | TÜM takımların oncall bilgilerini gösterir |
| **system-production** | Her Pazartesi 08:00 AM EST | Sadece Infrastructure oncall'u için topic günceller |

**Timezone:** America/Toronto (EST/EDT)

---

## 🔄 Güncelleme Prosedürü

Kod değişikliği yaptıktan sonra:

1. **Local'de değişikliği yap**
2. **VM'ye transfer et:**
   ```bash
   # Local'de
   cd ~/Desktop
   tar -czf oncall-slack-bot.tar.gz oncall-slack-bot/
   scp -i your-key.pem oncall-slack-bot.tar.gz ubuntu@your-vm-ip:~/

   # VM'de
   cd ~
   tar -xzf oncall-slack-bot.tar.gz
   cd oncall-slack-bot
   npm install
   pm2 restart carlton-oncall-bot
   ```

3. **Log'ları kontrol et:**
   ```bash
   pm2 logs carlton-oncall-bot
   ```

---

## 📞 Sorun Giderme

### Sorun: Bot başlamıyor
```bash
# Log'lara bak
pm2 logs carlton-oncall-bot --err

# Manuel başlat ve hatayı gör
cd ~/oncall-slack-bot
node index.js start
```

### Sorun: Mesajlar gitmiyor
```bash
# Datadog bağlantısını test et
node test-connection-only.js

# Slack token'ı test et
node test-slack-token-only.js
```

### Sorun: Zamanlama çalışmıyor
```bash
# VM'nin timezone'unu kontrol et
timedatectl

# Eğer yanlışsa düzelt (örnek: EST için)
sudo timedatectl set-timezone America/Toronto
```

### Sorun: Bot memory leak yapıyor
```bash
# Restart et
pm2 restart carlton-oncall-bot

# Otomatik restart ayarla (max memory 300MB)
pm2 start index.js --name carlton-oncall-bot --max-memory-restart 300M -- start
pm2 save
```

---

## ✅ Deployment Checklist

### Pre-deployment
- [ ] Cloud VM oluşturuldu
- [ ] SSH erişimi var
- [ ] Node.js 18+ kuruldu
- [ ] PM2 kuruldu

### Deployment
- [ ] Bot kodu VM'ye transfer edildi
- [ ] `npm install` çalıştırıldı
- [ ] `.env` dosyası yapılandırıldı
- [ ] Bot PM2 ile başlatıldı
- [ ] Log'lar kontrol edildi ve bot çalışıyor

### Post-deployment
- [ ] `pm2 save` çalıştırıldı
- [ ] `pm2 startup` yapılandırıldı
- [ ] Slack kanallarında bot'un aktif olduğu test edildi
- [ ] Bir sonraki scheduled post zamanı not edildi

### Monitoring
- [ ] `pm2 status` ile düzenli kontrol yapılacak
- [ ] Slack'te mesajların geldiği doğrulanacak
- [ ] VM'nin uptime'ı takip edilecek

---

## 🎯 Özet

```bash
# 1. VM'e bağlan
ssh -i key.pem ubuntu@vm-ip

# 2. Node.js kur
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Bot kodunu transfer et
# (scp ile)

# 4. Bağımlılıkları yükle
cd oncall-slack-bot
npm install

# 5. PM2 kur ve başlat
sudo npm install -g pm2
pm2 start index.js --name carlton-oncall-bot -- start
pm2 save
pm2 startup

# 6. Kontrol et
pm2 logs carlton-oncall-bot
```

**Hazır! Bot artık cloud'da 7/24 çalışıyor.** 🚀

---

## 📊 Sonraki Scheduled Post'lar

Bot başarıyla deploy edildikten sonra:

- **c1-oncall-bot**: Bir sonraki gün 09:00 AM EST'de mesaj gönderecek
- **system-production**: Bir sonraki Pazartesi 08:00 AM EST'de topic güncelleyecek

Log'lardan scheduled post'ları izleyebilirsiniz:
```bash
pm2 logs carlton-oncall-bot | grep "Scheduled post"
```

---

**Carlton One - System Production Team**
*Deployment Guide v1.0*
