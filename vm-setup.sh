#!/bin/bash

# Carlton One On-Call Bot - VM Initial Setup Script
# Bu script'i VM'de çalıştırın (ilk kurulum için)

set -e

echo "🔧 Carlton One On-Call Bot - VM Initial Setup"
echo "=============================================="
echo ""

# OS detection
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "❌ OS tespit edilemedi!"
    exit 1
fi

echo "Detected OS: $OS"
echo ""

# Node.js kurulumu
echo "📥 1. Node.js kurulumu..."
if command -v node &> /dev/null; then
    echo "Node.js zaten kurulu: $(node --version)"
else
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        echo "Ubuntu/Debian için Node.js 18.x kuruluyor..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [ "$OS" = "amzn" ]; then
        echo "Amazon Linux için Node.js 18.x kuruluyor..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm install 18
        nvm use 18
        nvm alias default 18
    else
        echo "⚠️  Bu OS için otomatik kurulum desteklenmiyor: $OS"
        echo "Node.js 18+ manuel olarak kurmanız gerekiyor."
        exit 1
    fi
    echo "✅ Node.js kuruldu: $(node --version)"
fi

echo ""

# PM2 kurulumu
echo "📥 2. PM2 process manager kurulumu..."
if command -v pm2 &> /dev/null; then
    echo "PM2 zaten kurulu: $(pm2 --version)"
else
    sudo npm install -g pm2
    echo "✅ PM2 kuruldu: $(pm2 --version)"
fi

echo ""

# Timezone ayarı
echo "🕐 3. Timezone ayarı..."
CURRENT_TZ=$(timedatectl | grep "Time zone" | awk '{print $3}')
echo "Mevcut timezone: $CURRENT_TZ"

if [ "$CURRENT_TZ" != "America/Toronto" ]; then
    echo "Timezone America/Toronto olarak ayarlanıyor..."
    sudo timedatectl set-timezone America/Toronto
    echo "✅ Timezone güncellendi: $(timedatectl | grep 'Time zone' | awk '{print $3}')"
else
    echo "✅ Timezone zaten doğru"
fi

echo ""

# Git kurulumu (opsiyonel)
echo "📥 4. Git kurulumu (opsiyonel)..."
if command -v git &> /dev/null; then
    echo "Git zaten kurulu: $(git --version)"
else
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        sudo apt-get install -y git
    elif [ "$OS" = "amzn" ]; then
        sudo yum install -y git
    fi
    echo "✅ Git kuruldu: $(git --version)"
fi

echo ""

# Firewall ayarı
echo "🔐 5. Firewall ayarı..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp
    echo "✅ UFW SSH izni verildi"
else
    echo "ℹ️  UFW bulunamadı, firewall ayarlarını manuel kontrol edin"
fi

echo ""
echo "=============================================="
echo "✅ VM hazırlığı tamamlandı!"
echo ""
echo "📋 Kurulu paketler:"
echo "  - Node.js: $(node --version)"
echo "  - NPM: $(npm --version)"
echo "  - PM2: $(pm2 --version)"
echo "  - Timezone: $(timedatectl | grep 'Time zone' | awk '{print $3}')"
echo ""
echo "📋 Sonraki adımlar:"
echo "  1. Bot kodunu bu VM'ye transfer et (scp veya git clone)"
echo "  2. cd oncall-slack-bot"
echo "  3. npm install"
echo "  4. pm2 start index.js --name carlton-oncall-bot -- start"
echo "  5. pm2 save && pm2 startup"
echo ""
echo "🎉 Hazır!"
