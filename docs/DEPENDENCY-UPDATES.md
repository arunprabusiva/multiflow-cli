# 📦 Dependency Update Guide

This guide explains how to safely update MultiFlow CLI dependencies.

## 🚨 Why Manual Updates?

**Automated dependency updates (dependabot) are disabled** because:
- Many packages moved to **ESM-only** (breaks CommonJS)
- Major version jumps introduce **breaking changes**
- CLI tools need **stability** over latest versions

## 🔍 Current Stable Versions

| Package | Current | Latest | Status |
|---------|---------|---------|---------|
| `chalk` | 5.6.2 | ✅ | Safe - CommonJS compatible |
| `commander` | 12.1.0 | ✅ | Safe - API stable |
| `inquirer` | 9.3.8 | ❌ v10+ ESM-only |
| `simple-git` | 3.19.1 | ✅ | Safe - CommonJS |
| `yaml` | 2.3.2 | ✅ | Safe - CommonJS |
| `@octokit/rest` | 20.1.1 | ❌ v21+ ESM-only |

## ✅ Safe Update Process

### 1. Check Compatibility First
```bash
# Check if package is ESM-only
npm view <package-name> type
# If "module" - it's ESM-only, avoid!
```

### 2. Test Updates Locally
```bash
# Update one package at a time
npm install <package-name>@<version>

# Test immediately
npm test
node src/cli.js --help
```

### 3. Check for Breaking Changes
- Read package **CHANGELOG** or **releases**
- Look for **BREAKING CHANGES** in major versions
- Test all CLI commands work

## 🚫 Packages to Avoid

### ESM-Only Packages (Will Break CLI)
- `inquirer` v10+ 
- `@octokit/rest` v21+
- `chalk` v6+ (future)
- Any package with `"type": "module"`

### Major Version Jumps
- Always check changelog for breaking changes
- Test thoroughly before updating
- Consider staying 1-2 major versions behind latest

## 📋 Update Checklist

Before updating any dependency:

- [ ] Check if package is CommonJS compatible
- [ ] Read changelog for breaking changes
- [ ] Update one package at a time
- [ ] Run `npm test` after each update
- [ ] Test CLI commands manually
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Commit changes with clear message

## 🔒 Security Updates

For security vulnerabilities:

1. **Check if fix is available in current major version**
2. **If not, evaluate ESM compatibility**
3. **Consider alternative packages if needed**
4. **Document any version locks in package.json**

## 📅 Update Schedule

**Recommended frequency:**
- **Security updates**: Immediate (if compatible)
- **Minor updates**: Monthly
- **Major updates**: Quarterly (with thorough testing)

## 🛠️ Manual Update Commands

```bash
# Check outdated packages
npm outdated

# Update specific package
npm install package-name@latest

# Update all compatible packages
npm update

# Check for security issues
npm audit
npm audit fix  # Only if no breaking changes
```

## 🚨 Emergency Rollback

If an update breaks the CLI:

```bash
# Rollback to previous version
npm install package-name@previous-version

# Or restore from git
git checkout HEAD~1 -- package.json package-lock.json
npm install
```

## 📞 Support

If you encounter issues with dependency updates:

1. Check this guide first
2. Test in isolated environment
3. Create issue with error details
4. Include Node.js version and OS

---

**✅ Remember: Stability > Latest versions for CLI tools!**