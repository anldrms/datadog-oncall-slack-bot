# Datadog On-Call Slack Bot

A Slack bot that automatically fetches and posts on-call engineer information from Datadog to Slack channels.

## Features

- Fetches current on-call information from Datadog On-Call schedules
- Posts formatted messages to Slack channels
- Optional automatic message pinning
- Configurable scheduling (cron-based)
- Support for multiple on-call schedules
- Beautiful formatted messages with engineer details and shift times

## Prerequisites

- Node.js (v14 or higher)
- A Datadog account with API access
- A Slack workspace with bot creation permissions

## Quick Start (Recommended)

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the setup wizard:
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

## Manual Configuration (Alternative)

If you prefer to configure manually instead of using the setup wizard:

### 1. Datadog Setup

Get your credentials from: https://app.datadoghq.eu/organization-settings/api-keys

You'll need:
- **API Key**
- **Application Key**
- **Site** (e.g., datadoghq.eu, datadoghq.com)

To find your Schedule ID:
1. Go to your Datadog On-Call dashboard: https://app.datadoghq.eu/on-call/schedules
2. Click on the schedule you want to monitor
3. The Schedule ID is in the URL

### 2. Slack Bot Setup

Create or configure your Slack app at: https://api.slack.com/apps

**Required OAuth Scopes** (Bot Token Scopes):
- `chat:write` - Post messages to channels
- `chat:write.public` - Post messages to public channels without joining
- `pins:write` - Pin messages (optional)

**Get your Bot Token**:
1. Go to "OAuth & Permissions" in your Slack app settings
2. Click "Install to Workspace"
3. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

**Get your Channel ID**:
1. Right-click on the channel in Slack → "View channel details"
2. Copy the Channel ID at the bottom

### 3. Environment Variables

Edit the `.env` file manually:

```env
# Datadog Configuration
DATADOG_API_KEY=your_api_key
DATADOG_APP_KEY=your_app_key
DATADOG_SITE=datadoghq.eu
DATADOG_SCHEDULE_ID=optional_schedule_id

# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_CHANNEL_ID=C1234567890

# Schedule Configuration (cron format)
CRON_SCHEDULE=0 9 * * *

# Pin message to channel (true/false)
PIN_MESSAGE=true
```

#### Cron Schedule Examples:
- `0 9 * * *` - Every day at 9:00 AM
- `0 9 * * 1-5` - Every weekday at 9:00 AM
- `0 9,17 * * *` - Every day at 9:00 AM and 5:00 PM
- `0 */6 * * *` - Every 6 hours
- `0 8 * * 1` - Every Monday at 8:00 AM

## Usage

### Test the bot (post immediately):
```bash
npm test
```
or
```bash
node index.js now
```

### Start the bot with scheduled posts:
```bash
npm start
```
or
```bash
node index.js start
```

The bot will:
1. Validate your configuration
2. Start running and wait for the scheduled time
3. Post on-call information automatically at the configured intervals
4. Optionally pin the messages to the channel

## Message Format

The bot posts beautifully formatted messages like:

```
🚨 Today's On-Call Engineers
────────────────────────────

📋 Platform Team Schedule
👤 Engineer: John Doe (john.doe@company.com)
⏰ Shift: Jan 23, 09:00 AM - Jan 24, 09:00 AM

────────────────────────────

Updated: January 23, 2025, 9:00 AM
```

## Troubleshooting

### "Missing required configuration"
- Make sure all required fields in `.env` are filled out
- Ensure your `.env` file is in the same directory as `index.js`

### "Error fetching on-call data from Datadog"
- Verify your Datadog API keys are correct
- Check that your Schedule ID is valid
- Ensure your Datadog account has access to On-Call schedules

### "Error posting to Slack"
- Verify your Slack bot token is correct
- Ensure the bot has the required OAuth scopes
- Check that the channel ID is correct
- Make sure the bot is installed in your workspace

### "Error pinning message"
- Ensure the bot has the `pins:write` scope
- The bot must be a member of private channels to pin messages

## Running in Production

### Using PM2 (Recommended):
```bash
npm install -g pm2
pm2 start index.js --name oncall-bot
pm2 save
pm2 startup
```

### Using Docker:
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

## Advanced Configuration

### Monitor Multiple Schedules
If you want to monitor multiple schedules, you can:
1. Remove or leave blank the `DATADOG_SCHEDULE_ID` to fetch all on-call schedules
2. Or create multiple bot instances with different configurations

### Custom Message Format
Edit the `formatOnCallMessage()` function in `index.js` to customize the message appearance.

## License

ISC
