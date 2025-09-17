# 🚀 Publishing Setup Guide

This guide explains how to set up automated publishing for Multimflow CLI.

## 📋 Prerequisites

1. **npm Account** with publishing rights to `multiflow-cli`
2. **GitHub Repository** with admin access
3. **npm Token** for automation

## 🔑 Step 1: Create npm Token

1. Go to [npm Access Tokens](https://www.npmjs.com/settings/tokens)
2. Click **"Generate New Token"**
3. Select **"Automation"** type
4. Copy the token (starts with `npm_`)

## 🔒 Step 2: Add GitHub Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click **"Add secret"**

## 🚀 Step 3: Publishing Process

### Manual Publishing (Recommended)

1. Go to **Actions** tab in GitHub
2. Select **"Publish to npm"** workflow
3. Click **"Run workflow"**
4. Choose options:
   - **Version bump**: `patch`, `minor`, or `major`
   - **npm tag**: `latest`, `beta`, or `alpha`
   - **Dry run**: `true` to test, `false` to publish

### Publishing Options

| Option | Description | Example |
|--------|-------------|---------|
| **patch** | Bug fixes | 2.0.5 → 2.0.6 |
| **minor** | New features | 2.0.5 → 2.1.0 |
| **major** | Breaking changes | 2.0.5 → 3.0.0 |

| Tag | Description | Install Command |
|-----|-------------|-----------------|
| **latest** | Stable release | `npm install -g multiflow-cli` |
| **beta** | Beta testing | `npm install -g multiflow-cli@beta` |
| **alpha** | Alpha testing | `npm install -g multiflow-cli@alpha` |

## 🧪 Step 4: Test Before Publishing

**Always run a dry run first:**

1. Set **Dry run** to `true`
2. Check the workmflow output
3. Verify package contents
4. If everything looks good, run with **Dry run** set to `false`

## 📦 What Happens During Publishing

1. **Tests run** - Ensures code quality
2. **Version bumps** - Updates package.json and CLI
3. **npm publishes** - Uploads to npm registry
4. **Git tags** - Creates version tag
5. **GitHub release** - Creates release with notes
6. **Summary** - Shows publish results

## 🔍 Verification

After publishing, verify:

1. **npm package**: https://www.npmjs.com/package/multiflow-cli
2. **GitHub release**: Check releases tab
3. **Installation test**:
   ```bash
   npm install -g multiflow-cli@latest
   mmflow --version
   ```

## 🚨 Troubleshooting

### "NPM_TOKEN secret not found"
- Add npm token to GitHub secrets (Step 2)

### "npm ERR! 403 Forbidden"
- Check npm token permissions
- Ensure you have publish rights to the package

### "npm ERR! You cannot publish over the previously published versions"
- Version already exists
- Choose a different version bump type

### "Authentication failed"
- Regenerate npm token
- Update GitHub secret

## 🔐 Security Best Practices

1. **Use Automation tokens** - More secure than Classic tokens
2. **Limit token scope** - Only grant necessary permissions
3. **Rotate tokens regularly** - Update every 6-12 months
4. **Monitor usage** - Check npm token usage logs

## 📞 Support

If you encounter issues:

1. Check the [GitHub Actions logs](https://github.com/arunprabusiva/multiflow-cli/actions)
2. Verify npm token in [npm settings](https://www.npmjs.com/settings/tokens)
3. Create an [issue](https://github.com/arunprabusiva/multiflow-cli/issues) if needed

---

**✅ Ready to publish? Run the workmflow with dry run first!**
