# 🏢 MultiFlow for Corporate Environments

> **Working with corporate laptops? No admin rights? Firewall restrictions? We've got you covered!**

## 🚀 Quick Start (No Admin Rights Needed)

### Option 1: Use npx (Recommended)
```bash
# No installation required - works immediately
npx multiflow-cli@latest --help
npx multiflow-cli@latest init
npx multiflow-cli@latest feature create my-feature
```

### Option 2: Local Installation
```bash
# Install in your user directory (no admin rights needed)
mkdir ~/.multiflow
npm install multiflow-cli --prefix ~/.multiflow
~/.multiflow/node_modules/.bin/multiflow-cli --help
```

### Option 3: Portable Version (Windows)
1. Download `multiflow-portable.bat`
2. Double-click to run
3. Use like: `multiflow-portable.bat --help`

## 🔧 Corporate Environment Solutions

### Problem: "EACCES permission denied"
**Solution:** Use npx or local installation
```bash
npx multiflow-cli@latest init  # No admin rights needed
```

### Problem: Firewall blocks npm registry
**Solution:** Configure corporate proxy
```bash
npm config set proxy http://your-proxy:port
npm config set https-proxy http://your-proxy:port
npm config set registry http://your-corporate-registry
```

### Problem: Old Node.js version
**Solution:** Request IT to install Node.js 16+
```bash
node --version  # Should be 16.0.0 or higher
```

### Problem: npm completely blocked
**Solution:** Download standalone version
```bash
# Download multiflow-standalone.js
node multiflow-standalone.js --help
```

## 📋 TCS Laptop Specific Instructions

### Method 1: npx (Works 99% of the time)
```bash
npx multiflow-cli@latest --version
npx multiflow-cli@latest init
```

### Method 2: Request IT Support
Ask your IT team to:
- Install Node.js 16+ 
- Allow npm access to registry.npmjs.org
- Configure corporate proxy settings

### Method 3: Offline Installation
1. Download MultiFlow on personal laptop
2. Copy `node_modules` folder to TCS laptop
3. Run with: `node path/to/multiflow-cli/src/cli.js`

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| `command not found: flow` | Use `npx multiflow-cli` instead |
| `EACCES permission denied` | Use `npx` or local install |
| `network timeout` | Configure proxy settings |
| `Node.js not found` | Install Node.js 16+ |

## 💡 Pro Tips for Corporate Users

1. **Use npx**: No installation, no admin rights needed
2. **Create alias**: `alias flow="npx multiflow-cli@latest"`
3. **Local install**: Install in user directory
4. **Portable version**: Download and run anywhere

## 📞 Need Help?

- 🐛 **Issues**: [GitHub Issues](https://github.com/arunprabusiva/multiflow-cli/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/arunprabusiva/multiflow-cli/discussions)
- 📧 **Email**: Include "TCS Corporate" in subject

---

**✅ MultiFlow works in corporate environments - choose the method that works for your restrictions!**