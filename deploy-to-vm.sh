#!/bin/bash

# Carlton One On-Call Bot - VM Deployment Script
# Bu script botu cloud VM'ye deploy eder

set -e

echo "🚀 Carlton One On-Call Bot - Cloud VM Deployment"
echo "=================================================="

# Kullanıcıdan VM bilgilerini al
read -p "VM IP adresi: " VM_IP
read -p "SSH key dosyası path (örn: ~/key.pem): " SSH_KEY
read -p "VM kullanıcı adı (örn: ubuntu): " VM_USER

echo ""
echo "📋 Deployment bilgileri:"
echo "  VM: $VM_USER@$VM_IP"
echo "  SSH Key: $SSH_KEY"
echo ""
read -p "Devam etmek için Enter'a bas..."

# SSH key izinlerini kontrol et
chmod 400 "$SSH_KEY"

echo ""
echo "📦 1. Bot kodunu paketliyorum..."
cd ~/Desktop
tar --exclude='node_modules' --exclude='.git' --exclude='bot.log' -czf oncall-slack-bot.tar.gz oncall-slack-bot/
echo "✅ Paket oluşturuldu: oncall-slack-bot.tar.gz"

echo ""
echo "📤 2. VM'ye transfer ediyorum..."
scp -i "$SSH_KEY" oncall-slack-bot.tar.gz "$VM_USER@$VM_IP":~/
echo "✅ Transfer tamamlandı"

echo ""
echo "🔧 3. VM'de kurulum yapıyorum..."
ssh -i "$SSH_KEY" "$VM_USER@$VM_IP" << 'ENDSSH'
  set -e

  echo "📦 Paketi açıyorum..."
  cd ~
  tar -xzf oncall-slack-bot.tar.gz
  cd oncall-slack-bot

  echo "📥 Bağımlılıkları yüklüyorum..."
  npm install --production

  echo "✅ Kurulum tamamlandı!"

  echo ""
  echo "🔍 Node.js versiyonu:"
  node --version

  echo ""
  echo "📋 .env dosyası kontrol ediliyor..."
  if [ -f .env ]; then
    echo "✅ .env dosyası mevcut"
    chmod 600 .env
  else
    echo "⚠️  .env dosyası bulunamadı!"
  fi

ENDSSH

echo ""
echo "✅ Deployment başarılı!"
echo ""
echo "📋 Sonraki adımlar:"
echo ""
echo "1. VM'ye bağlan:"
echo "   ssh -i $SSH_KEY $VM_USER@$VM_IP"
echo ""
echo "2. PM2 kur (ilk defa ise):"
echo "   sudo npm install -g pm2"
echo ""
echo "3. Bot'u başlat:"
echo "   cd ~/oncall-slack-bot"
echo "   pm2 start index.js --name carlton-oncall-bot -- start"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "4. Log'ları kontrol et:"
echo "   pm2 logs carlton-oncall-bot"
echo ""
echo "=================================================="

# Cleanup
rm ~/Desktop/oncall-slack-bot.tar.gz

echo ""
echo "🎉 Hazır! Yukarıdaki adımları takip et."
