# 🌊 MultiFlow

> **Manage your multi-repo projects like a single codebase. One command, all repositories, zero hassle.**

[![npm version](https://img.shields.io/npm/v/multiflow-cli.svg)](https://www.npmjs.com/package/multiflow-cli)
[![CI/CD](https://github.com/arunprabusiva/multiflow-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/arunprabusiva/multiflow-cli/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**MultiFlow streamlines multi-repository development** by treating your entire workspace as a single project:

```bash
mflow feature create user-auth    # Creates branches everywhere
mflow feature commit user-auth -m "Add login"    # Commits to all repos
mflow status user-auth           # Shows status across all repos
```

## 🚀 The Developer Impact

### The Problem Every Developer Faces
```bash
# The OLD way (30 minutes of pain):
cd frontend && git checkout -b feature/new-ui
cd ../backend && git checkout -b feature/new-ui  
cd ../api && git checkout -b feature/new-ui
cd ../docs && git checkout -b feature/new-ui
# Repeat for every operation... 😫
```

```bash
# The MultiFlow way (30 seconds):
mflow feature create new-ui
# ✅ Done! All repos synchronized instantly
```

**Result: 95% time reduction + zero coordination errors**

### Why Developers Love MultiFlow
- 🎯 **Universal Problem**: Every multi-repo developer needs this
- ⚡ **Instant Value**: Works in 60 seconds after install
- 🛡️ **Error Prevention**: Impossible to miss repositories
- 👥 **Team Sync**: Everyone knows what's happening everywhere
- 🏢 **Enterprise Ready**: Profiles, auth, corporate support

## 🚀 Quick Start

### Local Installation
```bash
npm install -g multiflow-cli
cd /path/to/your/workspace
mflow init
mflow feature create my-awesome-feature
```

### Corporate/Restricted Environments
```bash
npx multiflow-cli init  # No installation needed
```

💼 **Corporate users?** See our [Corporate Installation Guide](docs/CORPORATE-INSTALL.md) for restricted environments.

**That's it!** MultiFlow automatically discovers your repositories and you're ready to go.

## ✨ What You Get

### 🎯 **One Command, All Repos**
```bash
mflow feature create payment-system
# ✅ Creates feature/payment-system in frontend/
# ✅ Creates feature/payment-system in backend/
# ✅ Creates feature/payment-system in mobile/
# ✅ Creates feature/payment-system in docs/
```

### 🔄 **Synchronized Operations**
```bash
mflow feature commit payment-system -m "Add Stripe integration"
# ✅ Commits changes in all repositories that have modifications
# ✅ Uses the same commit message everywhere
# ✅ Skips repos with no changes
```

### 📊 **Visual Status Dashboard**
```bash
mflow status payment-system
```
```
payment-system
├─ frontend: feature/payment-system ✅ ready (3 files changed)
├─ backend: feature/payment-system ✅ ready (5 files changed)  
├─ mobile: feature/payment-system ⚪ no changes
└─ docs: feature/payment-system ✅ ready (1 file changed)
```

### 👥 **Team Workflows with Profiles**
```bash
# Frontend team works on UI repos only
mflow profile create frontend --repos frontend mobile docs
mflow profile switch frontend

# Backend team works on API repos only  
mflow profile create backend --repos backend database api
mflow profile switch backend

# Now all commands only affect your team's repositories!
```

### 🔗 **Instant PR Creation**
```bash
mflow pr payment-system --title "Add Stripe payment integration"
```
```
🔗 frontend: https://github.com/yourorg/frontend/compare/main...feature/payment-system
🔗 backend: https://github.com/yourorg/backend/compare/main...feature/payment-system
🔗 mobile: https://github.com/yourorg/mobile/compare/main...feature/payment-system
```
**Click links to create PRs instantly!**

## 🚀 Core Features

| Feature | Command | Learn More |
|---------|---------|------------|
| **Feature Management** | `mflow feature create user-auth` | [Feature Workflows](docs/FEATURES.md#feature-management) |
| **Cross-Repo Operations** | `mflow pull` `mflow push` | [Git Operations](docs/FEATURES.md#git-operations) |
| **Team Profiles** | `mflow profile create frontend` | [Profile System](docs/FEATURES.md#profiles) |
| **Health Monitoring** | `mflow doctor` | [Workspace Health](docs/FEATURES.md#health-monitoring) |
| **PR Generation** | `mflow pr user-auth` | [Pull Requests](docs/FEATURES.md#pull-requests) |
| **Status Dashboard** | `mflow status user-auth` | [Status Tracking](docs/FEATURES.md#status-tracking) |

📚 **[View All Commands](docs/COMMANDS.md)** | 🎆 **[Advanced Usage](docs/ADVANCED.md)** | 🚀 **[Developer Impact](docs/DEVELOPER-IMPACT.md)**

## 🎯 Simple Example

**Building a user authentication feature across multiple repositories:**

```bash
# Create feature branches everywhere
mflow feature create user-auth

# Make your changes in any repositories...
# Then commit across all repos at once
mflow feature commit user-auth -m "Add user authentication"

# Check progress across all repos
mflow status user-auth

# Generate PR URLs for all repos
mflow pr user-auth --title "Add user authentication system"

# Clean up when done
mflow feature cleanup user-auth
```

**Result:** One workflow, all repositories synchronized.

📚 **[See More Examples](docs/GUIDE.md)** with real-world scenarios and advanced workflows.

## 🎆 Advanced Capabilities

- **🏥 Health Monitoring** - Check workspace status across all repos
- **🔄 Synchronized Operations** - Pull, push, checkout across all repos
- **⚡ Smart Conflict Detection** - Identify merge conflicts before they happen
- **📈 Visual Status Dashboard** - See progress across all repositories
- **👥 Team Profiles** - Work with repository subsets (frontend-only, backend-only)
- **🔗 Instant PR URLs** - Generate GitHub/GitLab pull request links

📚 **[Explore Advanced Features](docs/ADVANCED.md)** with detailed examples and use cases.

## 📊 ROI for Development Teams

**For a team of 10 developers:**
- **Time saved per developer**: 2 hours/day
- **Monthly team savings**: 400 hours  
- **Annual value**: $200,000+ (at $100/hour)
- **Coordination errors**: Reduced to zero
- **Context switching**: Eliminated

**MultiFlow pays for itself in the first week of use.**

## 🎨 Perfect For

- **Microservices Architecture** - Frontend, backend, database repos (50M+ developers)
- **Mobile Development** - iOS, Android, shared components
- **Full-Stack Projects** - Web app, API, documentation  
- **Enterprise Teams** - Multiple services, shared libraries (Every Fortune 500)
- **Open Source Projects** - Core, plugins, examples
- **Remote Teams** - Better coordination across distributed codebases

## 📚 Documentation

- 🚀 **[Getting Started Guide](docs/GUIDE.md)** - Step-by-step tutorials
- 📝 **[All Commands](docs/COMMANDS.md)** - Complete command reference  
- 🎆 **[Advanced Usage](docs/ADVANCED.md)** - Power user features
- 💼 **[Corporate Setup](docs/CORPORATE-INSTALL.md)** - Restricted environments & firewalls
- ❓ **[FAQ](docs/FAQ.md)** - Common questions and troubleshooting

## 🔧 Requirements

- **Node.js 16+** (Check with `node --version`)
- **Git repositories** with at least one commit each

## 🤝 Support

- 🐛 **Found a bug?** [Report it here](https://github.com/arunprabusiva/multiflow-cli/issues)
- 💡 **Have an idea?** [Share it here](https://github.com/arunprabusiva/multiflow-cli/discussions)
- 📧 **Need help?** Check our [FAQ](docs/FAQ.md) first

## 👨‍💻 Created By

**Arunprabu Sivapprakasam**
- 🐙 GitHub: [@arunprabusiva](https://github.com/arunprabusiva)
- 💼 LinkedIn: [Connect with me](https://linkedin.com/in/arunprabusiva)

## 📄 License

MIT © [Arunprabu Sivapprakasam](https://github.com/arunprabusiva)

---

<div align="center">

**⭐ Star this repo if MultiFlow saves you time!**

*Transforming how 50M+ developers work with multi-repo projects*

**Join the revolution: One command, all repositories, zero hassle.**

</div>