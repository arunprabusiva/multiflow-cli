# 🌊 MultiFlow

> **Coordinate Git operations across multiple repositories with a single command.**

[![npm version](https://img.shields.io/npm/v/multiflow-cli.svg)](https://www.npmjs.com/package/multiflow-cli)
[![CI/CD](https://github.com/arunprabusiva/multiflow-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/arunprabusiva/multiflow-cli/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why MultiFlow?

**Problem:** Managing features across multiple repositories is complex and error-prone.

**Solution:** MultiFlow treats your multi-repo workspace as a single unit, enabling:
- ✅ **One command** creates branches everywhere
- ✅ **Synchronized commits** across repositories  
- ✅ **Profile-based workflows** - work on specific repo subsets
- ✅ **Smart Git operations** - pull, push, checkout across repos
- ✅ **Automated PR creation** with GitHub/GitLab URLs
- ✅ **Unified status** and health checking
- ✅ **Automated cleanup** when done

## Quick Start

```bash
# Install
npm install -g multiflow-cli

# Initialize workspace
cd your-workspace
flow init

# Create feature across all repos
flow feature create payment-system

# Commit changes everywhere
flow feature commit payment-system -m "Add payment integration"

# Check status
flow status payment-system

# Clean up when done
flow feature cleanup payment-system
```

## Core Commands

| Command | Description | Example |
|---------|-------------|----------|
| `flow init` | Initialize workspace | `flow init` |
| `flow feature create <name>` | Create feature branch everywhere | `flow feature create user-auth` |
| `flow feature commit <name> -m "msg"` | Commit across repos | `flow feature commit user-auth -m "Add login"` |
| `flow status <name>` | Show feature status | `flow status user-auth` |
| `flow feature cleanup <name>` | Remove feature branches | `flow feature cleanup user-auth` |

## Advanced Features

### Profile Management
Target specific repositories for different workflows:

```bash
# Create profiles
flow profile create frontend --repos frontend mobile
flow profile create backend --repos backend database
flow profile create fullstack --repos frontend backend mobile

# Switch profiles
flow profile switch frontend
flow feature create user-login  # Only affects frontend repos

# List profiles
flow profile list
```

### Git Operations
```bash
flow pull                    # Pull latest changes from all repos
flow push                    # Push changes to all repos
flow checkout main           # Switch branches across all repos
flow diff payment-system     # Show changes across repos
flow pr user-auth --title "Add authentication"  # Generate PR URLs
```

### Workspace Management
```bash
flow doctor                  # Check workspace health
flow config show             # Show workspace configuration
```

## Example Workflow

```bash
# 1. Setup (one time)
flow init

# 2. Create profiles for different teams
flow profile create frontend --repos frontend shared-components
flow profile create backend --repos backend database api

# 3. Switch to frontend profile
flow profile switch frontend

# 4. Start feature (only affects frontend repos)
flow feature create user-auth

# 5. Make changes in any repos, then commit
flow feature commit user-auth -m "Add authentication"

# 6. Check what's ready
flow status user-auth

# 7. Generate PR URLs
flow pr user-auth --title "Add user authentication"

# 8. Clean up when done
flow feature cleanup user-auth
```

## Documentation

- 📖 **[Complete Guide](docs/GUIDE.md)** - Detailed usage and examples
- 🔧 **[Commands Reference](docs/COMMANDS.md)** - All available commands  
- 🎆 **[Advanced Features](docs/ADVANCED.md)** - Selective ops, dry-run, stash
- 🔐 **[GitHub Integration](docs/GITHUB.md)** - Authentication and repo creation
- ❓ **[FAQ](docs/FAQ.md)** - Common questions and troubleshooting

## Requirements

- Node.js 16+
- Git repositories with at least one commit

## Author

**Arunprabu Sivapprakasam**
- GitHub: [@arunprabusiva](https://github.com/arunprabusiva)
- LinkedIn: [Connect with me](https://linkedin.com/in/arunprabusiva)

## License

MIT © [Arunprabu Sivapprakasam](https://github.com/arunprabusiva)

---

**Made for developers who work with multiple repositories** 🚀