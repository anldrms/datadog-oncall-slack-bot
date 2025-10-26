# Test Slack App Setup

## Your Test App Information
- **App ID**: A09NQDZFEUR
- **App URL**: https://api.slack.com/apps/A09NQDZFEUR

## Important: Token Types

You provided:
- ❌ **User Token** (`xoxe.xoxp-1-...`) - This is for user actions, NOT for bots
- ❌ **Refresh Token** (`xoxe-1-...`) - This is for refreshing user tokens

You need:
- ✅ **Bot User OAuth Token** (starts with `xoxb-`) - This is what the bot uses!

## How to Get the Bot Token

### Step 1: Add Bot Token Scopes

1. Go to: https://api.slack.com/apps/A09NQDZFEUR/oauth
2. Scroll down to **"Scopes"** section
3. Under **"Bot Token Scopes"** (NOT User Token Scopes), add:
   - `chat:write`
   - `chat:write.public`
   - `pins:write` (optional)

### Step 2: Install the App

1. After adding scopes, scroll to the top
2. Click **"Install to Workspace"** (or **"Reinstall App"** if already installed)
3. Review permissions and click **"Allow"**

### Step 3: Copy the Bot Token

After installation, you'll see:
- **Bot User OAuth Token**: `xoxb-9744103872695-...` ← **THIS IS WHAT YOU NEED!**

The token will start with `xoxb-` followed by your Client ID (9744103872695).

### Step 4: Get Your Channel ID

1. Open your test Slack workspace
2. Go to the channel where you want the bot to post
3. Right-click the channel name → "View channel details"
4. Scroll to the bottom and copy the Channel ID
5. It will look like: `C1234567890`

## Quick Test

Once you have the Bot Token and Channel ID, you can test immediately:

### Option 1: Use the Setup Wizard (Recommended)

```bash
cd /Users/anil.durmus/Desktop/oncall-slack-bot
npm run setup
```

When prompted:
1. Enter your Datadog credentials (already in .env)
2. Enter the **Bot Token** (xoxb-...)
3. Select the channel or enter Channel ID
4. The wizard will post a test message

### Option 2: Manual Configuration

Edit `.env` file:

```env
SLACK_BOT_TOKEN=xoxb-9744103872695-...
SLACK_CHANNEL_ID=C1234567890
```

Then test:

```bash
npm test
```

## Troubleshooting

### "not_authed" or "invalid_auth" error
- You're using the wrong token
- Make sure you're using the **Bot User OAuth Token** (xoxb-)
- NOT the User Token (xoxe.xoxp-)

### "channel_not_found" error
- The Channel ID is incorrect
- The bot doesn't have access to the channel
- For private channels: Invite the bot first with `/invite @YourBotName`

### Can't find Bot Token
1. Make sure you added **Bot Token Scopes** (not User Token Scopes)
2. Install or reinstall the app
3. Look for "OAuth Tokens for Your Workspace" section
4. Copy the token under "Bot User OAuth Token"

## Token Reference

From your app settings:

- **Client ID**: 9744103872695 (used in OAuth flows, not needed for this bot)
- **Client Secret**: ff73762ce902682578636f6383f3d579 (not needed for this bot)
- **Signing Secret**: 406b14d7ee43d6decd0cc9f100068912 (not needed for this bot)
- **Bot Token**: Get from OAuth page after installing (xoxb-...) ← **USE THIS!**

## Ready to Test!

Once you have:
1. ✅ Bot Token (xoxb-...)
2. ✅ Channel ID (C...)
3. ✅ Datadog credentials (already configured)

Run:
```bash
npm run setup
```

or

```bash
npm test
```

The bot will post a message to your test channel!
