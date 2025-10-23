# Datadog On-Call Slack Bot

A Slack bot that automatically fetches and posts on-call engineer information from Datadog to Slack channels.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

## Features

- 🔄 Fetches current on-call information from Datadog On-Call schedules
- 💬 Posts formatted messages to Slack channels
- 📌 Optional automatic message pinning
- ⏰ Configurable scheduling (cron-based)
- 📊 Support for multiple on-call schedules
- ✨ Beautiful formatted messages with engineer details and shift times
- 🎯 Interactive setup wizard with validation
- 🔍 Automatic schedule discovery

## Screenshots

### Slack Message Example
The bot posts beautifully formatted on-call information:

```
🚨 Today's On-Call Engineers
────────────────────────────

📋 Platform Team Schedule
👤 Engineer: John Doe (john.doe@company.com)
⏰ Shift: Jan 23, 09:00 AM - Jan 24, 09:00 AM

────────────────────────────
Updated: January 23, 2025, 9:00 AM
```

## Prerequisites

- Node.js (v14 or higher)
- A Datadog account with API access
- A Slack workspace with bot creation permissions

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Your Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "On-Call Bot") and select your workspace
4. Go to "OAuth & Permissions"
5. Add these Bot Token Scopes:
   - `chat:write` - Post messages to channels
   - `chat:write.public` - Post to public channels without joining
   - `pins:write` - Pin messages (optional)
6. Click "Install to Workspace"
7. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### 3. Get Your Datadog API Keys

1. Go to Datadog → Organization Settings → API Keys
2. Create or copy your API Key
3. Go to Application Keys
4. Create or copy your Application Key

### 4. Run the Setup Wizard

```bash
npm run setup
```

The setup wizard will guide you through:
- Validating your Datadog credentials
- Discovering available on-call schedules
- Configuring your Slack bot
- Testing the connection
- Setting up the posting schedule

**That's it!** The wizard does everything for you.

### 5. Test and Run

Test the bot (posts immediately):
```bash
npm test
```

Start the bot with scheduled posts:
```bash
npm start
```

## Manual Configuration

If you prefer to configure manually:

1. Copy `.env.example` to `.env`
2. Fill in your credentials
3. Run the bot

### Environment Variables

```env
# Datadog Configuration
DATADOG_API_KEY=your_datadog_api_key
DATADOG_APP_KEY=your_datadog_application_key
DATADOG_SITE=datadoghq.com
DATADOG_SCHEDULE_ID=your_schedule_id

# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_CHANNEL_ID=C1234567890

# Schedule Configuration (cron format)
CRON_SCHEDULE=0 9 * * *

# Pin message to channel (true/false)
PIN_MESSAGE=true
```

### Datadog Sites

Choose your Datadog site:
- `datadoghq.com` - US1 (Default)
- `us3.datadoghq.com` - US3
- `us5.datadoghq.com` - US5
- `datadoghq.eu` - EU1
- `ap1.datadoghq.com` - Asia Pacific

### Cron Schedule Examples

- `0 9 * * *` - Every day at 9:00 AM
- `0 9 * * 1-5` - Every weekday at 9:00 AM
- `0 9,17 * * *` - Every day at 9:00 AM and 5:00 PM
- `0 */6 * * *` - Every 6 hours
- `0 8 * * 1` - Every Monday at 8:00 AM

## Usage

### Commands

```bash
# Run setup wizard
npm run setup

# Post immediately (for testing)
npm test
# or
node index.js now

# Start with scheduled posts
npm start
# or
node index.js start
```

## Running in Production

### Using PM2 (Recommended)

```bash
npm install -g pm2
pm2 start index.js --name oncall-bot
pm2 save
pm2 startup
```

### Using Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["node", "index.js", "start"]
```

Build and run:

```bash
docker build -t oncall-bot .
docker run -d --env-file .env oncall-bot
```

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  oncall-bot:
    build: .
    env_file: .env
    restart: unless-stopped
```

Run:

```bash
docker-compose up -d
```

## Features in Detail

### Interactive Setup Wizard

The setup wizard (`npm run setup`) provides:
- ✅ Real-time credential validation
- ✅ Automatic Datadog schedule discovery
- ✅ Slack channel selection from a list
- ✅ Test message posting
- ✅ Automatic configuration file generation

### Message Formatting

Messages include:
- Schedule name
- Engineer name and email
- Shift start and end times
- Last update timestamp
- Professional formatting with emojis

### Multiple Schedules

- Leave `DATADOG_SCHEDULE_ID` empty to monitor all schedules
- Or specify a single schedule ID to monitor just one team

## Troubleshooting

### "Missing required configuration"
- Ensure all required fields in `.env` are filled
- Run `npm run setup` to reconfigure

### "Error fetching on-call data from Datadog"
- Verify your Datadog API keys are correct
- Check that your Schedule ID is valid
- Ensure your account has access to On-Call schedules

### "Error posting to Slack"
- Verify your Slack bot token is correct
- Ensure the bot has required OAuth scopes
- Check that the channel ID is correct
- For private channels, invite the bot: `/invite @YourBotName`

### "Error pinning message"
- Ensure the bot has `pins:write` scope
- The bot must be a member of private channels to pin messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [@slack/web-api](https://www.npmjs.com/package/@slack/web-api)
- Datadog API integration
- Cron scheduling with [node-cron](https://www.npmjs.com/package/node-cron)

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review your configuration in `.env`

## Roadmap

- [ ] Support for PagerDuty integration
- [ ] Web dashboard for configuration
- [ ] Slash commands for manual posting
- [ ] Multiple channel support
- [ ] Custom message templates
- [ ] Notification on schedule changes

---

Made with ❤️ for DevOps teams
