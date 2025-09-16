# 🌊 MultiFlow - Multi-Repo Workflow CLI

> **Streamline feature development across multiple repositories with a single command.**

Stop juggling between repositories! MultiFlow orchestrates Git operations across your entire multi-repo workspace, making feature development seamless and error-free.

[![npm version](https://img.shields.io/npm/v/multiflow-cli.svg)](https://www.npmjs.com/package/multiflow-cli)
[![CI/CD](https://github.com/arunprabusiva/multiflow-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/arunprabusiva/multiflow-cli/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Why MultiFlow?

**The Problem:** Modern applications span multiple repositories (frontend, backend, database, docs). Coordinating feature branches, commits, and PRs across repos is:
- ❌ Time-consuming and error-prone
- ❌ Leads to inconsistent branch states
- ❌ Makes code reviews complex
- ❌ Causes deployment headaches

**The Solution:** MultiFlow treats your multi-repo workspace as a single unit, enabling:
- ✅ **One command** to create feature branches everywhere
- ✅ **Synchronized commits** across all repositories
- ✅ **Conflict detection** before merge attempts
- ✅ **Automated cleanup** of feature branches
- ✅ **Visual status** of your entire feature workflow

## 📦 Installation

**Install from npm (recommended):**
```bash
npm install -g multiflow-cli
```

**Or clone and install locally:**
```bash
git clone https://github.com/arunprabusiva/multiflow-cli.git
cd multiflow-cli
npm install
npm link
```

## 🎯 Quick Start

### 1. **Setup Your Workspace**
```bash
# Navigate to your multi-repo folder
cd /path/to/your/workspace
# Example structure:
# workspace/
# ├── frontend/     (React app)
# ├── backend/      (Node.js API) 
# ├── database/     (SQL migrations)
# └── docs/         (Documentation)

# Authenticate with GitHub (optional)
flow auth login

# Initialize MultiFlow with auto-repo creation
flow init --create-missing
```

### 2. **Start a Feature**
```bash
# Creates feature/payment-system branch in ALL repos
flow feature create payment-system
```

### 3. **Make Your Changes**
```bash
# Edit files in any/all repositories
# frontend/src/PaymentForm.jsx
# backend/routes/payment.js  
# database/migrations/add_payments.sql
```

### 4. **Commit Across All Repos**
```bash
# Stages and commits changes in all repos with changes
flow feature commit payment-system -m "Add payment integration"
```

### 5. **Check Status**
```bash
flow status payment-system
```
**Output:**
```
payment-system
├─ frontend: feature/payment-system ✅ ready
├─ backend: feature/payment-system ✅ ready  
├─ database: feature/payment-system ⚪ untouched
└─ docs: feature/payment-system ✅ ready
```

### 6. **Publish & Merge**
```bash
# Push branches to remotes
flow feature publish payment-system

# Check for conflicts and prepare PRs
flow feature merge payment-system
```

### 7. **Cleanup When Done**
```bash
# Remove feature branches from all repos
flow feature cleanup payment-system
```

## 📋 Complete Command Reference

### Core Commands

| Command | Description | Example |
|---------|-------------|----------|
| `flow init` | Scan workspace and create config | `flow init --create-missing` |
| `flow auth login` | Authenticate with GitHub | `flow auth login` |
| `flow repo create <name>` | Create GitHub repository | `flow repo create backend --private` |
| `flow status <feature>` | Show feature status across repos | `flow status auth-system` |

### Feature Management

| Command | Description | Example |
|---------|-------------|----------|
| `flow feature create <name>` | Create feature branch everywhere | `flow feature create user-auth` |
| `flow feature commit <name> -m "msg"` | Commit changes across repos | `flow feature commit user-auth -m "Add login"` |
| `flow feature publish <name>` | Push branches to remotes | `flow feature publish user-auth` |
| `flow feature merge <name>` | Check conflicts, prepare PRs | `flow feature merge user-auth` |
| `flow feature cleanup <name>` | Delete feature branches | `flow feature cleanup user-auth` |

### Configuration Commands

| Command | Description | Example |
|---------|-------------|----------|
| `flow auth status` | Show GitHub authentication status | `flow auth status` |
| `flow repo link <name>` | Link local repo to GitHub | `flow repo link frontend` |
| `flow doctor` | Check workspace health | `flow doctor` |
| `flow checkout <branch>` | Switch branches across all repos | `flow checkout main` |
| `flow diff <feature>` | Show changes across repos | `flow diff payment-system` |
| `flow config show` | Show workspace configuration | `flow config show` |
| `flow config set-default-branch <repo> <branch>` | Set default branch for repo | `flow config set-default-branch frontend main` |

## 🧪 Live Test Example

Want to see MultiFlow in action? Here's a complete test you can run:

```bash
# 1. Create test workspace
mkdir multiflow-test && cd multiflow-test

# 2. Create mock repositories
mkdir frontend backend database
cd frontend && git init && echo "# Frontend" > README.md && git add . && git commit -m "Initial"
cd ../backend && git init && echo "# Backend" > README.md && git add . && git commit -m "Initial" 
cd ../database && git init && echo "# Database" > README.md && git add . && git commit -m "Initial"
cd ..

# 3. Initialize MultiFlow
flow init
# Output: Found 3 repositories ✅ Workspace initialized successfully

# 4. Create feature
flow feature create payment-system
# Output: ✅ Feature 'payment-system' created across all repos

# 5. Make changes
cd frontend && echo "PaymentForm component" > payment.js && git add .
cd ../backend && echo "Payment API" > payment.py && git add .
cd ..

# 6. Commit changes
flow feature commit payment-system -m "Add payment components"
# Output: ✅ Changes committed for feature 'payment-system'

# 7. Check status
flow status payment-system
# Output: Beautiful tree showing all repo states

# 8. Test merge readiness
flow feature merge payment-system
# Output: ✅ Ready for PR (files changed per repo)

# 9. Cleanup
flow feature cleanup payment-system
# Output: ✅ Feature 'payment-system' cleaned up
```

## ⚙️ Configuration

MultiFlow creates a `.flow.yml` file in your workspace:

```yaml
repos:
  frontend:
    path: frontend
    hasRemote: true
  backend:
    path: backend  
    hasRemote: true
  database:
    path: database
    hasRemote: false
features:
  payment-system:
    branch: feature/payment-system
    repos: [frontend, backend, database]
    created: 2024-01-15T10:30:00.000Z
```

## 🔧 Advanced Usage

### Working with Remotes
```bash
# MultiFlow automatically detects and works with:
# ✅ GitHub repositories
# ✅ GitLab repositories  
# ✅ Local-only repositories
# ✅ Mixed setups (some with remotes, some without)
```

### Multiple Features
```bash
# Work on multiple features simultaneously
flow feature create user-auth
flow feature create payment-system
flow feature create admin-panel

# Each feature is isolated per repository
flow status user-auth     # Shows user-auth branches
flow status payment-system # Shows payment-system branches
```

### Conflict Detection
```bash
# Before creating PRs, MultiFlow checks:
# ✅ Merge conflicts with main/master
# ✅ Files changed per repository
# ✅ Repositories with no changes

flow feature merge my-feature
# Output:
# ✅ frontend: Ready for PR (3 files changed)
# ⚠️  backend: Merge conflicts detected  
# ⚪ database: No changes to merge
```

## 🛠️ Requirements

- **Node.js 16+** (for running the CLI)
- **Git** (installed and configured)
- **Git repositories** (initialized with at least one commit)
- **GitHub/GitLab access** (optional, for remote operations)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 **Documentation**: [Full docs](https://github.com/arunprabusiva/multiflow-cli/wiki)
- 🐛 **Issues**: [Report bugs](https://github.com/arunprabusiva/multiflow-cli/issues)
- 💬 **Discussions**: [Ask questions](https://github.com/arunprabusiva/multiflow-cli/discussions)

---

## 👨‍💻 Created By

**MultiFlow** was created by [Arunprabu Sivapprakasam](https://github.com/arunprabusiva) to solve the real-world problem of coordinating feature development across multiple repositories.

*"Stop juggling between repositories - let MultiFlow orchestrate your multi-repo workflow!"*

---

**Made with ❤️ for developers who work with multiple repositories**