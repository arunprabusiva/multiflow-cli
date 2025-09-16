# Advanced Features

## Selective Operations

Target specific repositories instead of all repos in your workspace.

### Examples

```bash
# Create feature only in frontend and backend
flow feature create payment --repos frontend,backend

# Commit changes only in backend
flow feature commit payment -m "Update API" --repos backend

# Cleanup only frontend branch
flow feature cleanup payment --repos frontend
```

### Use Cases
- **API Changes**: Only backend repos need the feature
- **UI Updates**: Only frontend repos affected
- **Gradual Rollout**: Test in subset of repos first

## Dry Run Mode

Preview what MultiFlow would do without actually executing commands.

### Examples

```bash
# See which repos would get the feature branch
flow feature create payment --dry-run

# Preview what would be committed
flow feature commit payment -m "Update" --dry-run

# Check what would be cleaned up
flow feature cleanup payment --dry-run
```

### Output Example
```bash
$ flow feature create payment --dry-run

🔍 Dry run - would create feature branch:
  • frontend: feature/payment
  • backend: feature/payment
  • api-gateway: feature/payment
```

## Auto-Stash

Automatically stash uncommitted changes when creating feature branches.

### Examples

```bash
# Stash changes before creating feature
flow feature create payment --stash

# MultiFlow will:
# 1. Stash uncommitted changes in each repo
# 2. Create the feature branch
# 3. Leave stashes for you to apply later
```

### Stash Management
```bash
# View stashes in a repository
cd frontend
git stash list

# Apply stash when ready
git stash pop
```

## Smart Error Handling

MultiFlow handles partial failures gracefully and gives you options.

### Partial Success Example
```bash
$ flow feature create payment

✅ frontend: Created feature/payment
✅ backend: Created feature/payment
❌ database: Failed - uncommitted changes
❌ docs: Failed - branch already exists

⚠️  Partial success: 2/4 repositories
```

### Branch Existence Check
```bash
$ flow feature create payment

❌ Error: Branch 'feature/payment' already exists in: frontend, backend
💡 Tip: Use different name or cleanup existing branches first
```

## Repository Ignoring

Exclude repositories from MultiFlow operations.

### .multiflowignore File
```
# MultiFlow ignore file
# Add repository names (one per line)

docs
scripts
old-prototype
temp-experiments
```

### Commands
```bash
# Add to ignore list
flow config ignore docs

# Remove from ignore list  
flow config unignore docs

# View current configuration
flow config show
```

### Ignore Patterns
- **Documentation repos**: `docs`, `wiki`
- **Build/deployment**: `scripts`, `deploy`, `ci`
- **Experiments**: `prototype`, `spike`, `temp`
- **Legacy code**: `old-*`, `legacy-*`

## Combining Features

Advanced features work together for powerful workflows.

### Example: Careful Feature Creation
```bash
# Create feature with all safety features
flow feature create payment \
  --repos frontend,backend \
  --stash \
  --dry-run

# Review the plan, then execute without --dry-run
flow feature create payment \
  --repos frontend,backend \
  --stash
```

### Example: Selective Cleanup
```bash
# Cleanup only completed repos
flow feature cleanup payment --repos frontend

# Keep working on backend
flow status payment
# ├─ backend: feature/payment ✅ ready
```

## Best Practices

1. **Use --dry-run first** for destructive operations
2. **Use --stash** when switching contexts frequently  
3. **Use --repos** for focused development
4. **Ignore non-code repositories** to reduce noise
5. **Check status** before cleanup to avoid losing work