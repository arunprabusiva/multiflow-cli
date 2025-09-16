# 🌊 MultiFlow

> **Coordinate Git operations across multiple repositories with a single command.**

[![npm version](https://img.shields.io/npm/v/multiflow-cli.svg)](https://www.npmjs.com/package/multiflow-cli)
[![CI/CD](https://github.com/arunprabusiva/multiflow-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/arunprabusiva/multiflow-cli/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
```

## Why MultiFlow?

**Problem:** Managing features across multiple repositories is complex and error-prone.

**Solution:** MultiFlow treats your multi-repo workspace as a single unit.

- ✅ **One command** creates branches everywhere
- ✅ **Synchronized commits** across repositories  
- ✅ **Unified status** and health checking
- ✅ **Automated cleanup** when done

## Core Commands

| Command | Description |
|---------|-------------|
| `flow init` | Initialize workspace |
| `flow feature create <name>` | Create feature branch everywhere |
| `flow feature commit <name> -m "msg"` | Commit across repos |
| `flow status <name>` | Show feature status |
| `flow feature cleanup <name>` | Remove feature branches |

## Example Workflow

```bash
# 1. Setup (one time)
flow init

# 2. Start feature
flow feature create user-auth

# 3. Make changes in any repos, then commit
flow feature commit user-auth -m "Add authentication"

# 4. Check what's ready
flow status user-auth

# 5. Clean up when done
flow feature cleanup user-auth
```

## Documentation

- 📖 **[Complete Guide](docs/GUIDE.md)** - Detailed usage and examples
- 🔧 **[Commands Reference](docs/COMMANDS.md)** - All available commands
- 🔐 **[GitHub Integration](docs/GITHUB.md)** - Authentication and repo creation
- ❓ **[FAQ](docs/FAQ.md)** - Common questions and troubleshooting

## Requirements

- Node.js 16+
- Git repositories with at least one commit

## License

MIT © [Arunprabu Sivapprakasam](https://github.com/arunprabusiva)

---

**Made for developers who work with multiple repositories** 🚀