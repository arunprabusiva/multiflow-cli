# 🌊 MultiFlow - Multi-Repo Workflow CLI

> **Streamline feature development across multiple repositories with a single command.**

Stop juggling between repositories! MultiFlow orchestrates Git operations across your entire multi-repo workspace, making feature development seamless and error-free.

[![npm version](https://img.shields.io/npm/v/multiflow-cli.svg)](https://www.npmjs.com/package/multiflow-cli)
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
- ✅ **Profile-based workflows** - work on specific repo subsets
- ✅ **Smart Git operations** - pull, push, checkout across repos
- ✅ **Automated PR creation** with GitHub/GitLab URLs
- ✅ **Conflict detection** before merge attempts
- ✅ **Workspace health monitoring** and diagnostics
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
cd /path/to/your/workspace
flow init
```
**Example workspace structure:**
```
workspace/
├── frontend/     (React app)
├── backend/      (Node.js API) 
├── database/     (SQL migrations)
└── docs/         (Documentation)
```

### 2. **Start a Feature**
```bash
flow feature create payment-system
```
Creates `feature/payment-system` branch in ALL repositories

### 3. **Make Your Changes**
Edit files in any/all repositories:
- `frontend/src/PaymentForm.jsx`
- `backend/routes/payment.js`  
- `database/migrations/add_payments.sql`

### 4. **Commit Across All Repos**
```bash
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
flow feature publish payment-system
flow feature merge payment-system
```
Push branches to remotes and check for conflicts

### 7. **Cleanup When Done**
```bash
flow feature cleanup payment-system
```
Remove feature branches from all repositories

## 📋 Complete Command Reference

### Core Commands

| Command | Description | Example |
|---------|-------------|----------|
| `flow init` | Scan workspace and create config | `flow init` |
| `flow status <feature>` | Show feature status across repos | `flow status auth-system` |
| `flow doctor` | Check workspace health | `flow doctor` |
| `flow about` | Show MultiFlow information | `flow about` |

### Git Operations

| Command | Description | Example |
|---------|-------------|----------|
| `flow pull` | Pull latest changes from all repos | `flow pull` |
| `flow push` | Push changes to all repos | `flow push` |
| `flow checkout <branch>` | Switch branches across all repos | `flow checkout main` |
| `flow diff <feature>` | Show changes across repos | `flow diff payment-system` |
| `flow pr <feature>` | Create pull requests for feature | `flow pr user-auth --title "Add authentication"` |

### Feature Management

| Command | Description | Example |
|---------|-------------|----------|
| `flow feature create <name>` | Create feature branch everywhere | `flow feature create user-auth` |
| `flow feature commit <name> -m "msg"` | Commit changes across repos | `flow feature commit user-auth -m "Add login"` |
| `flow feature publish <name>` | Push branches to remotes | `flow feature publish user-auth` |
| `flow feature merge <name>` | Check conflicts, prepare PRs | `flow feature merge user-auth` |
| `flow feature cleanup <name>` | Delete feature branches | `flow feature cleanup user-auth` |

### Profile Management

| Command | Description | Example |
|---------|-------------|----------|
| `flow profile create <name> --repos <list>` | Create new profile | `flow profile create frontend --repos frontend mobile` |
| `flow profile list` | List all profiles | `flow profile list` |
| `flow profile show <name>` | Show profile details | `flow profile show frontend` |
| `flow profile switch <name>` | Switch to profile | `flow profile switch frontend` |
| `flow profile delete <name>` | Delete profile (with confirmation) | `flow profile delete old-profile` |

### Configuration Commands

| Command | Description | Example |
|---------|-------------|----------|
| `flow config show` | Show workspace configuration | `flow config show` |
| `flow config set-default-branch <repo> <branch>` | Set default branch for repo | `flow config set-default-branch frontend main` |

## 🧪 Live Test Example

Want to see MultiFlow in action? Here's a complete test you can run:

```bash
# 1. Create test workspace
mkdir multiflow-test && cd multiflow-test

# 2. Create mock repositories
mkdir frontend backend mobile
cd frontend && git init && echo "# Frontend" > README.md && git add . && git commit -m "Initial"
cd ../backend && git init && echo "# Backend" > README.md && git add . && git commit -m "Initial" 
cd ../mobile && git init && echo "# Mobile" > README.md && git add . && git commit -m "Initial"
cd ..

# 3. Initialize MultiFlow
flow init

# 4. Create profiles
flow profile create frontend-only --repos frontend
flow profile create fullstack --repos frontend backend mobile

# 5. Switch to frontend profile
flow profile switch frontend-only

# 6. Create feature (only affects frontend)
flow feature create user-login

# 7. Make changes and commit
cd frontend && echo "Login component" > Login.js && git add .
cd ..
flow feature commit user-login -m "Add login component"

# 8. Check workspace health
flow doctor

# 9. Switch to fullstack profile
flow profile switch fullstack

# 10. Create cross-repo feature
flow feature create payment-system

# 11. Show differences
flow diff user-login --summary

# 12. Create pull requests
flow pr payment-system --title "Add payment integration"

# 13. Cleanup
flow feature cleanup user-login
flow feature cleanup payment-system

# 14. Profile management
flow profile list
flow profile delete frontend-only
```

## ⚙️ Configuration

MultiFlow creates a `.flow.yml` file in your workspace:

```yaml
repos:
  frontend:
    path: frontend
    hasRemote: true
    defaultBranch: main
  backend:
    path: backend  
    hasRemote: true
    defaultBranch: main
  mobile:
    path: mobile
    hasRemote: false
    defaultBranch: master
    
profiles:
  frontend-only:
    repos: [frontend]
    created: 2024-01-15T10:30:00.000Z
  fullstack:
    repos: [frontend, backend, mobile]
    created: 2024-01-15T11:00:00.000Z
    
settings:
  activeProfile: fullstack
  
features:
  payment-system:
    branch: feature/payment-system
    repos: [frontend, backend, mobile]
    created: 2024-01-15T10:30:00.000Z
```

## 🔧 Advanced Usage

### Working with Remotes
MultiFlow automatically detects and works with:
- ✅ **GitHub repositories**
- ✅ **GitLab repositories**  
- ✅ **Local-only repositories**
- ✅ **Mixed setups** (some with remotes, some without)

### Multiple Features
**Work on multiple features simultaneously:**
```bash
flow feature create user-auth
flow feature create payment-system
flow feature create admin-panel
```

**Each feature is isolated per repository:**
```bash
flow status user-auth      # Shows user-auth branches
flow status payment-system # Shows payment-system branches
```

### Profile-Based Development
**Create profiles for different development workflows:**
```bash
flow profile create frontend-only --repos frontend shared-components
flow profile create backend-only --repos backend database
flow profile create fullstack --repos frontend backend mobile
```

**Switch between profiles:**
```bash
flow profile switch frontend-only
flow feature create user-login
```
Now all commands only affect: `frontend`, `shared-components`

**List profiles with active indicator:**
```bash
flow profile list
```
**Output:**
```
✅ frontend-only (2 repos) ← active
⚪ backend-only (2 repos)
⚪ fullstack (3 repos)
```

### Git Operations
**Pull/Push across all active repositories:**
```bash
flow pull    # Pull latest changes
flow push    # Push local changes
```

**Create pull requests with generated URLs:**
```bash
flow pr payment-system --title "Add Stripe integration"
```
**Output:**
```
🔗 frontend: Create PR at: https://github.com/user/frontend/compare/main...feature/payment-system
🔗 backend: Create PR at: https://github.com/user/backend/compare/main...feature/payment-system
```

### Conflict Detection
Before creating PRs, MultiFlow automatically checks:
- ✅ **Merge conflicts** with main/master
- ✅ **Files changed** per repository
- ✅ **Repositories with no changes**

```bash
flow feature merge my-feature
```
**Output:**
```
✅ frontend: Ready for PR (3 files changed)
⚠️  backend: Merge conflicts detected  
⚪ database: No changes to merge
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
- 🎆 **Features Guide**: [Complete features documentation](FEATURES.md)
- 🐛 **Issues**: [Report bugs](https://github.com/arunprabusiva/multiflow-cli/issues)
- 💬 **Discussions**: [Ask questions](https://github.com/arunprabusiva/multiflow-cli/discussions)

---

## 👨‍💻 Created By

**MultiFlow** was created by [Arunprabu Sivapprakasam](https://github.com/arunprabusiva) to solve the real-world problem of coordinating feature development across multiple repositories.

*"Stop juggling between repositories - let MultiFlow orchestrate your multi-repo workflow!"*

---

**Made with ❤️ for developers who work with multiple repositories**