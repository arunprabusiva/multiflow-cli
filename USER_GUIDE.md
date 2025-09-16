# 📖 MultiFlow User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Basic Workflow](#basic-workflow)
3. [Advanced Features](#advanced-features)
4. [Troubleshooting](#troubleshooting)
5. [Best Practices](#best-practices)

## Getting Started

### Prerequisites
- Node.js 16 or higher
- Git installed and configured
- At least one Git repository in your workspace

### Installation Steps

**Option 1: Install from npm (recommended)**
```bash
# Install globally
npm install -g multiflow-cli

# Verify installation
flow --version
flow --help
```

**Option 2: Install from source**
```bash
# Clone repository
git clone https://github.com/arunprabusiva/multiflow-cli.git
cd multiflow-cli

# Install dependencies and link
npm install
npm link

# Verify installation
flow --version
```

### Setting Up Your First Workspace

1. **Navigate to Your Multi-Repo Folder**
   ```bash
   cd /path/to/your/workspace
   ```
   
   Your workspace should look like:
   ```
   my-project/
   ├── frontend/        # React/Vue/Angular app
   ├── backend/         # API server
   ├── database/        # Migrations/schemas
   ├── mobile/          # Mobile app
   └── docs/            # Documentation
   ```

2. **Initialize MultiFlow**
   ```bash
   flow init
   ```
   
   This will:
   - Scan for Git repositories
   - Create `.flow.yml` configuration
   - Display found repositories

## Basic Workflow

### 1. Creating a Feature

```bash
# Create feature branches across all repos
flow feature create user-authentication

# What happens:
# ✅ Creates 'feature/user-authentication' in each repo
# ✅ Switches to the new branch in each repo
# ✅ Pushes to remote if configured
# ✅ Updates .flow.yml tracking
```

### 2. Making Changes

Work normally in your repositories:
```bash
# Edit files in any repository
vim frontend/src/Login.jsx
vim backend/routes/auth.js
vim database/migrations/001_users.sql

# Stage changes as usual
cd frontend && git add .
cd ../backend && git add .
cd ../database && git add .
```

### 3. Committing Changes

```bash
# Commit across all repos with changes
flow feature commit user-authentication -m "Implement user login system"

# What happens:
# ✅ Commits staged changes in each repo
# ✅ Uses the same commit message everywhere
# ✅ Skips repos with no changes
# ✅ Shows success/failure per repo
```

### 4. Checking Status

```bash
flow status user-authentication
```

**Example Output:**
```
user-authentication
├─ frontend: feature/user-authentication ✅ ready
├─ backend: feature/user-authentication ✅ ready
├─ database: feature/user-authentication ⚪ untouched
├─ mobile: feature/user-authentication ✅ ready
└─ docs: feature/user-authentication ⚪ untouched
```

### 5. Publishing Changes

```bash
# Push all feature branches to remotes
flow feature publish user-authentication

# What happens:
# ✅ Pushes each branch to its remote
# ✅ Skips repos without remotes
# ✅ Shows push status per repo
```

### 6. Preparing for Merge

```bash
# Check for conflicts and prepare PRs
flow feature merge user-authentication

# What happens:
# ✅ Checks for merge conflicts
# ✅ Lists changed files per repo
# ✅ Identifies repos ready for PRs
# ⚠️ Warns about conflicts
```

### 7. Cleaning Up

```bash
# Remove feature branches after merge
flow feature cleanup user-authentication

# What happens:
# ✅ Switches to master/main branch
# ✅ Deletes local feature branch
# ✅ Deletes remote feature branch
# ✅ Removes from .flow.yml tracking
```

## Advanced Features

### Working with Multiple Features

```bash
# Create multiple features
flow feature create user-auth
flow feature create payment-system
flow feature create admin-dashboard

# Work on different features
flow status user-auth
flow status payment-system

# Each feature is completely isolated
```

### Handling Repositories Without Remotes

MultiFlow works with mixed setups:
```bash
# Some repos have GitHub remotes
# Some repos are local-only
# MultiFlow handles both seamlessly

flow init  # Detects remote status
# Output shows: hasRemote: true/false per repo
```

### Custom Commit Messages

```bash
# Different commit messages per operation
flow feature commit my-feature -m "Add user authentication"
flow feature commit my-feature -m "Fix login validation"
flow feature commit my-feature -m "Update user tests"
```

### Selective Repository Operations

Currently, MultiFlow operates on all repositories. Future versions will support:
```bash
# Coming soon:
flow feature create my-feature --repos frontend,backend
flow feature commit my-feature --exclude docs,mobile
```

## Troubleshooting

### Common Issues

#### 1. "Feature not found" Error
```bash
# Error: Feature 'my-feature' not found
# Solution: Check available features
cat .flow.yml  # Look at features section
flow status    # Will be added in future versions
```

#### 2. Git Conflicts During Merge Check
```bash
# Error: Merge conflicts detected
# Solution: Resolve conflicts manually
cd problematic-repo
git checkout master
git pull
git checkout feature/my-feature
git merge master  # Resolve conflicts
git add . && git commit
```

#### 3. Permission Denied on Remote Push
```bash
# Error: Permission denied (publickey)
# Solution: Check SSH keys or use HTTPS
git remote -v  # Check remote URLs
git remote set-url origin https://github.com/user/repo.git
```

#### 4. Branch Already Exists
```bash
# Error: Branch 'feature/my-feature' already exists
# Solution: Use different name or cleanup existing
flow feature cleanup my-feature  # Remove existing
flow feature create my-feature-v2  # Use new name
```

### Debug Mode

Add debug logging (future feature):
```bash
# Coming soon:
DEBUG=multiflow flow feature create my-feature
```

## Best Practices

### 1. Naming Conventions

**Good Feature Names:**
```bash
flow feature create user-authentication
flow feature create payment-integration
flow feature create admin-dashboard
flow feature create bug-fix-login
```

**Avoid:**
```bash
flow feature create test        # Too generic
flow feature create "my feature"  # Spaces cause issues
flow feature create FEATURE-1   # Use lowercase
```

### 2. Commit Message Guidelines

```bash
# Good commit messages
flow feature commit auth -m "Add JWT authentication middleware"
flow feature commit auth -m "Implement user login validation"
flow feature commit auth -m "Fix password hashing algorithm"

# Avoid
flow feature commit auth -m "updates"  # Too vague
flow feature commit auth -m "WIP"      # Not descriptive
```

### 3. Repository Organization

**Recommended Structure:**
```
workspace/
├── .flow.yml           # MultiFlow config
├── frontend/           # UI application
├── backend/            # API server
├── database/           # Schema/migrations
├── shared/             # Common utilities
├── docs/               # Documentation
└── scripts/            # Build/deploy scripts
```

### 4. Workflow Tips

1. **Always run `flow init` first** in a new workspace
2. **Check status frequently** with `flow status <feature>`
3. **Commit often** with descriptive messages
4. **Test merge readiness** before creating PRs
5. **Clean up features** after successful merges

### 5. Team Collaboration

```bash
# Team member workflow:
git clone <workspace-repos>  # Clone all repos
flow init                    # Initialize MultiFlow
flow feature create my-task  # Start working
# ... make changes ...
flow feature commit my-task -m "Implement feature"
flow feature publish my-task # Share with team
```

### 6. CI/CD Integration

MultiFlow works alongside your existing CI/CD:
```bash
# MultiFlow handles Git operations
flow feature create deployment-fix
flow feature commit deployment-fix -m "Fix Docker config"
flow feature publish deployment-fix

# Your CI/CD handles:
# - Running tests
# - Building applications  
# - Deploying to environments
```

## Configuration Reference

### .flow.yml Structure

```yaml
repos:
  frontend:
    path: frontend          # Relative path to repo
    hasRemote: true        # Has GitHub/GitLab remote
  backend:
    path: backend
    hasRemote: true
  database:
    path: database
    hasRemote: false       # Local-only repo

features:
  user-auth:
    branch: feature/user-auth
    repos: [frontend, backend, database]
    created: "2024-01-15T10:30:00.000Z"
  payment-system:
    branch: feature/payment-system  
    repos: [frontend, backend]
    created: "2024-01-16T14:20:00.000Z"
```

### Environment Variables

```bash
# GitHub token for API access (future feature)
export GITHUB_TOKEN=your_token_here

# Custom branch prefix (future feature)  
export FLOW_BRANCH_PREFIX=feature/

# Default commit message (future feature)
export FLOW_DEFAULT_MESSAGE="Update feature"
```

---

**Need help?** Open an issue on [GitHub](https://github.com/arunprabusiva/multiflow-cli/issues) or check our [FAQ](https://github.com/arunprabusiva/multiflow-cli/wiki/FAQ).