# Commands Reference

## Core Commands

### `mflow init`
Initialize workspace and scan for repositories.

```bash
mflow init                    # Basic initialization
mflow init --create-missing   # Auto-create GitHub repos for local folders
```

### `mflow feature`
Manage features across repositories.

```bash
mflow feature create <name>              # Create feature branch everywhere
mflow feature create <name> --repos frontend,backend  # Target specific repos
mflow feature create <name> --dry-run    # Preview without executing
mflow feature create <name> --stash      # Auto-stash uncommitted changes

mflow feature commit <name> -m "msg"     # Commit changes across repos
mflow feature commit <name> -m "msg" --repos backend  # Commit specific repos
mflow feature commit <name> -m "msg" --dry-run        # Preview commits

mflow feature publish <name>             # Push branches to remotes
mflow feature merge <name>               # Check merge readiness
mflow feature cleanup <name>             # Delete feature branches
mflow feature cleanup <name> --repos frontend --dry-run  # Preview cleanup
```

### `mflow status`
Show feature status across repositories.

```bash
mflow status <name>           # Basic status
mflow status <name> --detailed # Detailed with commit counts
```

## Utility Commands

### `mflow checkout`
Switch branches across all repositories.

```bash
mflow checkout main           # Switch all repos to main
mflow checkout feature-name   # Switch to feature branch
```

### `mflow diff`
Show changes across repositories.

```bash
mflow diff <feature>          # Show changed files
mflow diff <feature> --summary # Show change statistics
```

### `mflow doctor`
Check workspace health.

```bash
mflow doctor                  # Health check all repositories
```

## Configuration

### `mflow config`
Manage workspace configuration.

```bash
mflow config show                              # Show current config
mflow config ignore <repo>                    # Ignore repository
mflow config unignore <repo>                  # Stop ignoring repository
```

## GitHub Integration

### `mflow auth`
GitHub authentication.

```bash
mflow auth login              # Browser-based OAuth login
mflow auth token <token>      # Login with personal access token
mflow auth status             # Show authentication status
mflow auth logout             # Logout
```

### `mflow repo`
Repository management.

```bash
mflow repo create <name>              # Create GitHub repository
mflow repo create <name> --private    # Create private repository
mflow repo link <name>                # Link local repo to GitHub
```
