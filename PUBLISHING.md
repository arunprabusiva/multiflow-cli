# Publishing Guide

## npm 2FA Issue

The automated publishing workflow fails because npm requires 2FA (One-Time Password) for publishing.

### Solutions:

#### Option 1: Manual Publishing (Recommended)
```bash
# Publish manually with 2FA
npm publish --otp=123456
```

#### Option 2: Disable 2FA for Automation Token
1. Go to https://www.npmjs.com/settings/tokens
2. Create an "Automation" token (bypasses 2FA)
3. Update GitHub secret `NPM_TOKEN` with the automation token

#### Option 3: Use npm provenance (GitHub Actions)
```bash
npm publish --provenance --access public
```

## Current Workflow

The GitHub Actions workflow is set up but will fail on the publish step due to 2FA.
You can:
1. Run the workflow to test everything except publishing
2. Publish manually with `npm publish --otp=<your-code>`
3. The workflow will then create the git tag and GitHub release

## Package.json Fixes Applied

- Fixed bin path format
- Fixed repository URL format
- These warnings should no longer appear