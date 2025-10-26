# Quick Start Guide

Get your On-Call Slack Bot running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Prepare Your Slack App

Before running the setup wizard, make sure your Slack app has the right permissions:

1. Go to your Slack app: https://api.slack.com/apps/A09NEU4CEE8/oauth
2. Under "Bot Token Scopes", add these permissions:
   - `chat:write`
   - `chat:write.public`
   - `pins:write` (optional)
3. Click "Install to Workspace" (or "Reinstall App")
4. Keep the page open - you'll need to copy the Bot Token

## Step 3: Run Setup Wizard

```bash
npm run setup
```

The wizard will ask you for:

### Datadog Configuration
- **API Key**: Get from https://app.datadoghq.eu/organization-settings/api-keys
- **Application Key**: Same page as above
- **Site**: Choose your Datadog region (EU, US, etc.)
- **Schedule**: The wizard will show you available schedules to choose from

### Slack Configuration
- **Bot Token**: Copy from the OAuth page you opened in Step 2 (starts with `xoxb-`)
- **Channel**: The wizard will show you available channels to choose from

### Schedule Configuration
- **When to post**: Choose from common schedules or create a custom cron expression
- **Pin messages**: Whether to pin the on-call message to the channel

## Step 4: Test It

The wizard will automatically post a test message to your channel.

After setup completes, test again:

```bash
npm test
```

You should see a message posted to your Slack channel!

## Step 5: Start the Bot

```bash
npm start
```

The bot will now run continuously and post on-call information according to your schedule.

## Troubleshooting

### "Invalid credentials"
- Double-check your Datadog API keys
- Make sure you selected the correct Datadog site

### "Unable to post test message"
- Verify your Slack bot token is correct
- Ensure the bot has the required OAuth scopes
- Check that you selected the right channel
- For private channels, invite the bot to the channel first: `/invite @OncallBot`

### "Unable to fetch schedules"
- Make sure you have on-call schedules configured in Datadog
- Verify your Datadog API keys have the right permissions

## What's Next?

Once the bot is running:
- It will automatically post on-call information according to your schedule
- Messages will be pinned if you enabled that option
- Check the logs to see when the next scheduled post will occur

### Running in Production

For production use, consider using a process manager like PM2:

```bash
npm install -g pm2
pm2 start index.js --name oncall-bot
pm2 save
pm2 startup
```

Or run in Docker - see the main README.md for instructions.

## Need Help?

- Check the full README.md for detailed documentation
- Review your `.env` file to verify all settings
- Run `npm run setup` again to reconfigure
