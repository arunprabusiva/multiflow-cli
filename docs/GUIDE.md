# Multimflow Complete Guide

## Installation

```bash
npm install -g multiflow-cli
```

## Workspace Setup

Multimflow works with any directory containing multiple Git repositories:

```
workspace/
├── frontend/    (React app)
├── backend/     (Node.js API)
├── database/    (SQL migrations)
└── docs/        (Documentation)
```

Initialize your workspace:

```bash
cd workspace
mflow init
```

This creates a `.multiflow.yml` configuration file tracking your repositories.

## Feature Development Workflow

### 1. Create Feature
```bash
mflow feature create payment-system
```
Creates `feature/payment-system` branch in all repositories.

### 2. Develop
Make changes in any repositories as needed.

### 3. Commit
```bash
mflow feature commit payment-system -m "Add payment integration"
```
Commits changes in repositories that have modifications.

### 4. Check Status
```bash
mflow status payment-system
```
Shows which repositories have the feature branch and their status.

### 5. Publish (Optional)
```bash
mflow feature publish payment-system
```
Pushes feature branches to remote repositories.

### 6. Cleanup
```bash
mflow feature cleanup payment-system
```
Removes feature branches from all repositories.

## Advanced Features

### Health Checking
```bash
mflow doctor
```
Checks for:
- Uncommitted changes
- Unpushed commits
- Repository health

### Branch Management
```bash
mflow checkout main           # Switch all repos to main
mflow checkout develop        # Switch all repos to develop
```

### Change Analysis
```bash
mflow diff payment-system     # Show changed files
mflow diff payment-system -s  # Show change summary
```

## Configuration

Multimflow creates `.multiflow.yml` in your workspace:

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

features:
  payment-system:
    branch: feature/payment-system
    repos: [frontend, backend]
    created: 2024-01-15T10:30:00.000Z

workspace:
  name: my-project
  defaultPrivacy: public
```

## Ignoring Repositories

Create `.multiflowignore` to exclude repositories:

```
# Multimflow ignore file
# Add repository names (one per line) to exclude from operations

docs
scripts
old-prototype
```

Or use commands:
```bash
mflow config ignore docs        # Add to ignore list
mflow config unignore docs      # Remove from ignore list
```

## Best Practices

1. **Initialize once** per workspace
2. **Use descriptive feature names** (e.g., `user-authentication`, `payment-integration`)
3. **Commit regularly** across repositories
4. **Check status** before major operations
5. **Clean up** completed features
6. **Run doctor** periodically for health checks
