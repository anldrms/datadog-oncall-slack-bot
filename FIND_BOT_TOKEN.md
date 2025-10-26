# How to Find Your Bot Token (Step-by-Step)

## Current Status

Your test Slack app:
- **App ID**: A09NQDZFEUR
- **Direct Link**: https://api.slack.com/apps/A09NQDZFEUR/oauth

## The Problem

You have **User tokens**, but need the **Bot token**:

| What You Have | What You Need |
|---------------|---------------|
| ❌ `xoxe.xoxp-1-...` (User Token) | ✅ `xoxb-...` (Bot Token) |
| ❌ `xoxe-1-...` (Refresh Token) | |

## Step-by-Step Instructions

### 1. Open Your App Settings

Click here: **https://api.slack.com/apps/A09NQDZFEUR/oauth**

### 2. Add Bot Scopes (If Not Already Done)

Look for the section **"Scopes"**

Under **"Bot Token Scopes"** (scroll down), you should see:
```
Bot Token Scopes
These scopes define what your bot can do.

+ Add an OAuth Scope
```

Click **"+ Add an OAuth Scope"** and add:
- `chat:write`
- `chat:write.public`
- `pins:write`

⚠️ **Important**: Make sure you're adding to **"Bot Token Scopes"**, NOT "User Token Scopes"

### 3. Install the App

After adding scopes, scroll back to the top of the page.

You'll see a yellow banner:
```
⚠️ You've made changes to your app's scopes.
Please reinstall your app to apply these changes.
```

Click **"Reinstall to Workspace"** (or **"Install to Workspace"** if first time)

### 4. Authorize the App

A new page will open asking for permissions:
```
OnCall Bot is requesting permission to access the [Workspace Name]

OnCall Bot will be able to:
✓ Send messages to channels
✓ ...

[Cancel] [Allow]
```

Click **"Allow"**

### 5. Copy the Bot Token

After clicking "Allow", you'll be redirected back to the OAuth page.

Now look for this section (near the top):
```
OAuth Tokens for Your Workspace

Bot User OAuth Token
xoxb-9744103872695-9787860050992-...
[Show] [Copy]

User OAuth Token
xoxe.xoxp-1-...
```

Click **"Copy"** next to **"Bot User OAuth Token"** (the one starting with `xoxb-`)

### 6. Update Your .env File

Open `/Users/anil.durmus/Desktop/oncall-slack-bot/.env`

Replace:
```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
```

With your actual token:
```env
SLACK_BOT_TOKEN=xoxb-9744103872695-9787860050992-...
```

### 7. Get Your Channel ID

In Slack:
1. Right-click on the channel where you want the bot to post
2. Click **"View channel details"**
3. Scroll to the bottom
4. You'll see: **"Channel ID: C1234567890"**
5. Copy this ID

Update `.env`:
```env
SLACK_CHANNEL_ID=C1234567890
```

### 8. Test It!

```bash
cd /Users/anil.durmus/Desktop/oncall-slack-bot
npm test
```

You should see a message posted in your Slack channel!

## Visual Guide

```
OAuth & Permissions Page Structure:
┌─────────────────────────────────────────┐
│ OAuth Tokens for Your Workspace         │
│                                         │
│ Bot User OAuth Token ← YOU NEED THIS   │
│ xoxb-9744...            [Copy] [Show]  │
│                                         │
│ User OAuth Token ← NOT THIS            │
│ xoxe.xoxp-1-...         [Copy] [Show]  │
└─────────────────────────────────────────┘
        ↓ Scroll Down ↓
┌─────────────────────────────────────────┐
│ Scopes                                  │
│                                         │
│ Bot Token Scopes ← ADD SCOPES HERE     │
│ • chat:write                           │
│ • chat:write.public                    │
│ • pins:write                           │
│ [+ Add an OAuth Scope]                 │
└─────────────────────────────────────────┘
```

## Still Can't Find It?

### If you don't see "Bot User OAuth Token":
1. Make sure you added **Bot Token Scopes** (not User Token Scopes)
2. Make sure you installed the app to your workspace
3. Try refreshing the page

### If you see "token_revoked" error:
1. Reinstall the app
2. Get a new token from the OAuth page

### Need More Help?

Check the official Slack documentation:
https://api.slack.com/authentication/token-types

Or run the setup wizard:
```bash
npm run setup
```

The wizard will validate your token automatically and tell you if something is wrong.

## Quick Links

- Your app: https://api.slack.com/apps/A09NQDZFEUR
- OAuth page: https://api.slack.com/apps/A09NQDZFEUR/oauth
- Bot settings: https://api.slack.com/apps/A09NQDZFEUR/general

## Summary

✅ **Correct token format**: `xoxb-9744103872695-...`
❌ **Wrong token format**: `xoxe.xoxp-1-...` or `xoxe-1-...`

Once you have the `xoxb-` token, you're ready to test!
