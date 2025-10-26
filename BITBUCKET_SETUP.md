# Pushing to Bitbucket

The repository has been initialized with git. Here's how to push it to Bitbucket.

## Option 1: Push to Existing Bitbucket Repository

If you already have a Bitbucket repository:

```bash
# Add your Bitbucket repository as remote
git remote add origin https://bitbucket.org/YOUR_WORKSPACE/YOUR_REPO.git

# Or using SSH
git remote add origin git@bitbucket.org:YOUR_WORKSPACE/YOUR_REPO.git

# Push to Bitbucket
git push -u origin main
```

## Option 2: Create New Bitbucket Repository

1. Go to your Bitbucket workspace: https://bitbucket.org/
2. Click **"Create repository"**
3. Set the repository name (e.g., `oncall-slack-bot`)
4. Make it **Private** (recommended - contains sensitive configs)
5. Leave "Include a README" **unchecked** (we already have one)
6. Click **"Create repository"**

Then run:

```bash
# Use the git URL from Bitbucket
git remote add origin https://bitbucket.org/YOUR_WORKSPACE/oncall-slack-bot.git

# Push to Bitbucket
git push -u origin main
```

## What's Included in the Repository

✅ **Included:**
- `index.js` - Main bot application
- `setup.js` - Interactive setup wizard
- `package.json` - Dependencies
- `README.md` - Full documentation
- `QUICKSTART.md` - Quick start guide
- `SLACK_SETUP.md` - Slack configuration guide
- `.gitignore` - Protects sensitive files
- `.env.example` - Template for configuration

❌ **NOT Included (Protected by .gitignore):**
- `.env` - Your actual credentials (never commit this!)
- `node_modules/` - Dependencies
- `.DS_Store` - macOS files

## Important Security Notes

### 🔒 The `.env` file is NOT pushed to Bitbucket

Your `.env` file contains sensitive credentials and is protected by `.gitignore`. This is intentional for security.

**For team members to use the bot:**

1. They clone the repository
2. Run `npm install`
3. Run `npm run setup` to configure their own `.env` file
4. Or manually copy `.env.example` to `.env` and fill in the values

### Sharing Credentials Securely

If you need to share credentials with team members:

**Option 1: Use the Setup Wizard (Recommended)**
- Team members run `npm run setup`
- Share the Datadog and Slack credentials securely (via password manager, encrypted message, etc.)
- Each person configures their own environment

**Option 2: Bitbucket Repository Variables**
If running in CI/CD:
1. Go to Repository Settings → Repository variables
2. Add encrypted variables:
   - `DATADOG_API_KEY`
   - `DATADOG_APP_KEY`
   - `SLACK_BOT_TOKEN`
   - etc.

**Option 3: Secret Management Service**
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- etc.

## Cloning and Setting Up for Team Members

When someone else clones the repository:

```bash
# Clone the repository
git clone https://bitbucket.org/YOUR_WORKSPACE/oncall-slack-bot.git
cd oncall-slack-bot

# Install dependencies
npm install

# Run setup wizard
npm run setup

# Or manually configure
cp .env.example .env
# Edit .env with actual credentials
```

## Updating the Repository

After making changes:

```bash
# Check what changed
git status

# Stage your changes
git add .

# Commit
git commit -m "Description of your changes"

# Push to Bitbucket
git push
```

## Branch Protection (Recommended)

For production use, consider:
1. Creating a `develop` branch for changes
2. Using `main` branch for stable releases
3. Setting up pull request workflows
4. Adding branch permissions in Bitbucket settings

## Current Repository Status

```
✅ Git repository initialized
✅ Initial commit created
✅ All files staged
⏳ Ready to push to Bitbucket remote
```

Just add your Bitbucket remote and push!
