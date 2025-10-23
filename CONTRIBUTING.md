# Contributing to Datadog On-Call Slack Bot

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear title and description
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Your environment (Node.js version, OS, etc.)

### Suggesting Features

Feature suggestions are welcome! Please open an issue with:
- A clear description of the feature
- Use cases and benefits
- Any implementation ideas you have

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use clear, descriptive variable names
- Add comments for complex logic
- Follow existing code formatting
- Keep functions focused and concise

### Testing

Before submitting a PR:
- Test the setup wizard works correctly
- Verify the bot can post messages successfully
- Check that scheduled posts work as expected
- Ensure no credentials are hardcoded

### Documentation

If your change affects how users interact with the bot:
- Update the README.md
- Add examples if applicable
- Update the setup wizard if needed

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/oncall-slack-bot.git
cd oncall-slack-bot

# Install dependencies
npm install

# Create .env file for testing
cp .env.example .env
# Fill in test credentials

# Test your changes
npm test
```

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## Questions?

Open an issue with your question, and we'll help you out!

Thank you for contributing! 🎉
