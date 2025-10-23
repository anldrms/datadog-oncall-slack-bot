# Publishing to GitHub

This repository is ready to be pushed to GitHub as a public project.

## What's Different from the Private Repo?

This public version has been sanitized:
- ✅ No company-specific details
- ✅ No hardcoded credentials
- ✅ Generic documentation
- ✅ MIT License
- ✅ Contributing guidelines
- ✅ Professional README with badges

## Steps to Publish

### 1. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `datadog-oncall-slack-bot` (or your preferred name)
3. Description: "A Slack bot that automatically posts Datadog on-call schedules to Slack channels"
4. Make it **Public** ✅
5. **Don't** initialize with README, .gitignore, or license (we already have them)
6. Click "Create repository"

### 2. Push to GitHub

Copy the commands from GitHub's quick setup page, or use these:

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/datadog-oncall-slack-bot.git

# Push to GitHub
git push -u origin main
```

Or with SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/datadog-oncall-slack-bot.git
git push -u origin main
```

### 3. Configure Repository Settings (Optional)

On GitHub, go to Settings:

**About Section:**
- Add description
- Add topics: `slack-bot`, `datadog`, `oncall`, `nodejs`, `slack-api`
- Add website (if you have documentation)

**Features:**
- Enable Issues (for bug reports and feature requests)
- Enable Discussions (for community Q&A)

**GitHub Pages (Optional):**
- Create a nice landing page for the project

## Maintaining Both Repositories

You now have two repositories:

### Private (Bitbucket)
- Location: `bitbucket.util.carlton.ca/sys/datadog-on-call-slack-bot`
- Purpose: Company-specific deployment
- Contains: All files including company-specific docs

### Public (GitHub)
- Location: `github.com/YOUR_USERNAME/datadog-oncall-slack-bot`
- Purpose: Open source sharing
- Contains: Sanitized version for public use

## Syncing Changes

When you make improvements to the code:

**For code changes (index.js, setup.js):**
1. Update in the private repo
2. Copy changes to public repo
3. Push to both

**For documentation:**
- Private repo: Can reference company specifics
- Public repo: Keep generic

## What's Safe to Share

✅ **Safe:**
- Source code (index.js, setup.js)
- Setup wizard
- Generic documentation
- Examples
- Bug fixes
- Feature improvements

❌ **Never share:**
- `.env` files with real credentials
- Company-specific details
- Internal URLs or hostnames
- API keys or tokens
- Channel IDs
- Schedule IDs

## Adding GitHub Actions (Optional)

Consider adding CI/CD:

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [14, 16, 18]
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm install
      - run: npm test --if-present
```

## Repository Badges

Add to your README (update username):

```markdown
![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/datadog-oncall-slack-bot)
![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/datadog-oncall-slack-bot)
![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/datadog-oncall-slack-bot)
```

## Next Steps After Publishing

1. ⭐ Star your own repository
2. 📝 Share it on social media
3. 💬 Engage with issues and PRs
4. 🔄 Keep it updated
5. 📚 Improve documentation based on feedback

Good luck with your open source project! 🚀
