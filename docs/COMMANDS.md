# Commands Reference

## Core Commands

### `flow init`
Initialize workspace and scan for repositories.

```bash
flow init                    # Basic initialization
flow init --create-missing   # Auto-create GitHub repos for local folders
```

### `flow feature`
Manage features across repositories.

```bash
flow feature create <name>              # Create feature branch everywhere
flow feature commit <name> -m "msg"     # Commit changes across repos
flow feature publish <name>             # Push branches to remotes
flow feature merge <name>               # Check merge readiness
flow feature cleanup <name>             # Delete feature branches
```

### `flow status`
Show feature status across repositories.

```bash
flow status <name>           # Basic status
flow status <name> --detailed # Detailed with commit counts
```

## Utility Commands

### `flow checkout`
Switch branches across all repositories.

```bash
flow checkout main           # Switch all repos to main
flow checkout feature-name   # Switch to feature branch
```

### `flow diff`
Show changes across repositories.

```bash
flow diff <feature>          # Show changed files
flow diff <feature> --summary # Show change statistics
```

### `flow doctor`
Check workspace health.

```bash
flow doctor                  # Health check all repositories
```

## Configuration

### `flow config`
Manage workspace configuration.

```bash
flow config show                              # Show current config
flow config set-default-branch <repo> <branch> # Set default branch
```

## GitHub Integration

### `flow auth`
GitHub authentication.

```bash
flow auth login              # Browser-based OAuth login
flow auth token <token>      # Login with personal access token
flow auth status             # Show authentication status
flow auth logout             # Logout
```

### `flow repo`
Repository management.

```bash
flow repo create <name>              # Create GitHub repository
flow repo create <name> --private    # Create private repository
flow repo link <name>                # Link local repo to GitHub
```