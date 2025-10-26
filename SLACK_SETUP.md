# Slack App Setup Guide

## Your App Information
- **App ID**: A09NEU4CEE8
- **App URL**: https://api.slack.com/apps/A09NEU4CEE8

## Step-by-Step Setup

### Step 1: Add Bot Token Scopes

1. Go to: https://api.slack.com/apps/A09NEU4CEE8/oauth
2. Scroll to **"Scopes"** section → **"Bot Token Scopes"**
3. Click **"Add an OAuth Scope"** and add these three scopes:
   - `chat:write` - Allows the bot to post messages
   - `chat:write.public` - Allows posting to channels without joining
   - `pins:write` - Allows pinning messages (optional)

### Step 2: Install the App to Your Workspace

1. Scroll to the top of the OAuth page
2. Click the **"Install to Workspace"** button (or **"Reinstall App"** if already installed)
3. Review the permissions and click **"Allow"**

### Step 3: Copy Your Bot Token

After installation, you'll see:
- **Bot User OAuth Token**: `xoxb-...` (this is what you need!)

**Important**:
- ✅ Use the **Bot User OAuth Token** (starts with `xoxb-`)
- ❌ NOT the User OAuth Token
- ❌ NOT the Client Secret
- ❌ NOT the Signing Secret

### Step 4: Run the Setup Wizard

Now you're ready to configure the bot:

```bash
npm run setup
```

When the wizard asks for your Slack Bot Token, paste the token that starts with `xoxb-`.

## What Each Token/Secret Is For

From the information you provided:

- **App ID** (A09NEU4CEE8): Identifies your app
- **Client ID** (422188603073...): Used for OAuth flows (not needed for this bot)
- **Client Secret** (64d8e8d8f72bb3d34aa077424bcd2842): Used for OAuth flows (not needed)
- **Signing Secret** (338b10aeea4cc3fbff010270f85faa72): Used to verify requests FROM Slack TO your app (not needed for this bot)
- **Verification Token** (4mnz1zW1...): Deprecated, not needed
- **Bot User OAuth Token** (xoxb-...): ✅ **THIS IS WHAT YOU NEED!** Get it from Step 3 above

## Quick Links

- Add Scopes: https://api.slack.com/apps/A09NEU4CEE8/oauth
- Install App: https://api.slack.com/apps/A09NEU4CEE8/install-on-team
- Bot Configuration: https://api.slack.com/apps/A09NEU4CEE8/general

## Troubleshooting

### Can't find Bot User OAuth Token?
1. Make sure you've added the bot token scopes (Step 1)
2. Install or reinstall the app (Step 2)
3. Go to: https://api.slack.com/apps/A09NEU4CEE8/oauth
4. Look for "OAuth Tokens for Your Workspace" section
5. Copy the token that starts with `xoxb-`

### Bot can't post to channel?
- For public channels: Make sure you have `chat:write.public` scope
- For private channels: Invite the bot to the channel first: `/invite @YourBotName`

### Need to change permissions?
1. Add/remove scopes at: https://api.slack.com/apps/A09NEU4CEE8/oauth
2. Click "Reinstall App" after making changes
3. You'll get a new Bot Token - update your `.env` file

## Next Steps

After getting your Bot Token:
1. Run `npm run setup`
2. Follow the wizard prompts
3. Test with `npm test`
4. Start the bot with `npm start`
