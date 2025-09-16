# MultiFlow Complete Guide

## Installation

```bash
npm install -g multiflow-cli
```

## Workspace Setup

MultiFlow works with any directory containing multiple Git repositories:

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
flow init
```

This creates a `.multiflow.yml` configuration file tracking your repositories.

## Feature Development Workflow

### 1. Create Feature
```bash
flow feature create payment-system
```
Creates `feature/payment-system` branch in all repositories.

### 2. Develop
Make changes in any repositories as needed.

### 3. Commit
```bash
flow feature commit payment-system -m "Add payment integration"
```
Commits changes in repositories that have modifications.

### 4. Check Status
```bash
flow status payment-system
```
Shows which repositories have the feature branch and their status.

### 5. Publish (Optional)
```bash
flow feature publish payment-system
```
Pushes feature branches to remote repositories.

### 6. Cleanup
```bash
flow feature cleanup payment-system
```
Removes feature branches from all repositories.

## Advanced Features

### Health Checking
```bash
flow doctor
```
Checks for:
- Uncommitted changes
- Unpushed commits
- Repository health

### Branch Management
```bash
flow checkout main           # Switch all repos to main
flow checkout develop        # Switch all repos to develop
```

### Change Analysis
```bash
flow diff payment-system     # Show changed files
flow diff payment-system -s  # Show change summary
```

## Configuration

MultiFlow creates `.multiflow.yml` in your workspace:

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
# MultiFlow ignore file
# Add repository names (one per line) to exclude from operations

docs
scripts
old-prototype
```

Or use commands:
```bash
flow config ignore docs        # Add to ignore list
flow config unignore docs      # Remove from ignore list
```

## Best Practices

1. **Initialize once** per workspace
2. **Use descriptive feature names** (e.g., `user-authentication`, `payment-integration`)
3. **Commit regularly** across repositories
4. **Check status** before major operations
5. **Clean up** completed features
6. **Run doctor** periodically for health checks