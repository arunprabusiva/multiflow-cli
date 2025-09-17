# 🌊 MultiFlow

> **Stop juggling between repositories. Manage your multi-repo projects like a single codebase.**

[![npm version](https://img.shields.io/npm/v/multiflow-cli.svg)](https://www.npmjs.com/package/multiflow-cli)
[![CI/CD](https://github.com/arunprabusiva/multiflow-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/arunprabusiva/multiflow-cli/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## The Problem You Face Daily

Working with multiple repositories is **painful**:
- 🔄 Switching between 5+ terminal tabs
- 😰 Forgetting to create branches in some repos
- 🐛 Inconsistent commits across repositories
- ⏰ Wasting hours on repetitive Git operations
- 🤯 Complex feature coordination

## Your Solution: MultiFlow

**One command. All repositories. Zero hassle.**

MultiFlow treats your entire multi-repo workspace as a single project:

```bash
flow feature create user-auth    # Creates branches everywhere
flow feature commit user-auth -m "Add login"    # Commits to all repos
flow status user-auth           # Shows status across all repos
```

## 🚀 Get Started in 30 Seconds

```bash
# 1. Install MultiFlow
npm install -g multiflow-cli

# 2. Navigate to your workspace
cd /path/to/your/workspace

# 3. Initialize (one-time setup)
flow init

# 4. Start working!
flow feature create my-awesome-feature
```

**That's it!** MultiFlow automatically discovers your repositories and you're ready to go.

## ✨ What You Get

### 🎯 **One Command, All Repos**
```bash
flow feature create payment-system
# ✅ Creates feature/payment-system in frontend/
# ✅ Creates feature/payment-system in backend/
# ✅ Creates feature/payment-system in mobile/
# ✅ Creates feature/payment-system in docs/
```

### 🔄 **Synchronized Operations**
```bash
flow feature commit payment-system -m "Add Stripe integration"
# ✅ Commits changes in all repositories that have modifications
# ✅ Uses the same commit message everywhere
# ✅ Skips repos with no changes
```

### 📊 **Visual Status Dashboard**
```bash
flow status payment-system
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
flow profile create frontend --repos frontend mobile docs
flow profile switch frontend

# Backend team works on API repos only  
flow profile create backend --repos backend database api
flow profile switch backend

# Now all commands only affect your team's repositories!
```

### 🔗 **Instant PR Creation**
```bash
flow pr payment-system --title "Add Stripe payment integration"
```
```
🔗 frontend: https://github.com/yourorg/frontend/compare/main...feature/payment-system
🔗 backend: https://github.com/yourorg/backend/compare/main...feature/payment-system
🔗 mobile: https://github.com/yourorg/mobile/compare/main...feature/payment-system
```
**Click links to create PRs instantly!**

## 📋 Essential Commands

| What You Want To Do | Command | Result |
|---------------------|---------|---------|
| Start a new feature | `flow feature create user-auth` | Creates branches in all repos |
| Save your progress | `flow feature commit user-auth -m "Add login"` | Commits changes everywhere |
| Check your status | `flow status user-auth` | Shows progress across repos |
| Create pull requests | `flow pr user-auth --title "Add authentication"` | Generates PR URLs |
| Clean up when done | `flow feature cleanup user-auth` | Removes branches from all repos |

## 🎯 Real-World Example

**Scenario:** You're building a new user authentication system that touches frontend, backend, and mobile apps.

### Without MultiFlow (The Old Way) 😫
```bash
# Terminal 1 - Frontend
cd frontend
git checkout -b feature/user-auth
# ... make changes ...
git add . && git commit -m "Add login form"

# Terminal 2 - Backend  
cd ../backend
git checkout -b feature/user-auth
# ... make changes ...
git add . && git commit -m "Add auth endpoints"

# Terminal 3 - Mobile
cd ../mobile
git checkout -b feature/user-auth
# ... make changes ...
git add . && git commit -m "Add login screen"

# Repeat for docs, database, etc...
```

### With MultiFlow (The New Way) 🚀
```bash
# One terminal, one workspace
flow feature create user-auth
# ... make changes in any/all repos ...
flow feature commit user-auth -m "Add user authentication"
flow status user-auth
flow pr user-auth --title "Add user authentication system"
flow feature cleanup user-auth
```

**Result:** What took 30 minutes now takes 2 minutes.

## 🛠️ Advanced Features

### Health Monitoring
```bash
flow doctor
```
```
🏥 Workspace Health Check
✅ frontend: Clean working directory
⚠️  backend: 3 uncommitted changes
✅ mobile: Clean working directory
```

### Cross-Repo Operations
```bash
flow pull          # Pull latest from all repos
flow push          # Push changes to all repos  
flow checkout main # Switch all repos to main branch
```

### Smart Conflict Detection
```bash
flow feature merge user-auth
```
```
✅ frontend: Ready for PR (3 files changed)
⚠️  backend: Merge conflicts detected
⚪ mobile: No changes to merge
```

## 🎨 Perfect For

- **Microservices Architecture** - Frontend, backend, database repos
- **Mobile Development** - iOS, Android, shared components
- **Full-Stack Projects** - Web app, API, documentation
- **Enterprise Teams** - Multiple services, shared libraries
- **Open Source Projects** - Core, plugins, examples

## 📚 Need Help?

- 📖 **[Complete Guide](docs/GUIDE.md)** - Step-by-step tutorials
- 🔧 **[All Commands](docs/COMMANDS.md)** - Complete reference  
- 🎆 **[Advanced Features](docs/ADVANCED.md)** - Power user tips
- ❓ **[FAQ](docs/FAQ.md)** - Common questions

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

*Made with ❤️ for developers who work with multiple repositories*

</div>