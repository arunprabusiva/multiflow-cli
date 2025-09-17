# GitHub Integration

Multimflow can automatically create and manage GitHub repositories.

## Authentication

### Option 1: Personal Access Token (Recommended)
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Create token with `repo` scope
3. Login with MultiFlow:

```bash
mflow auth token ghp_your_token_here
```

### Option 2: Browser Login (Future)
```bash
mflow auth login  # Opens browser for OAuth (requires setup)
```

## Auto-Create Repositories

When initializing a workspace with local repositories that don't have GitHub remotes:

```bash
mflow init --create-missing
```

Multimflow will:
1. Detect local repositories without remotes
2. Ask if you want to create GitHub repositories
3. Let you choose public/private for new repositories
4. Create repositories and link them automatically

## Manual Repository Creation

```bash
mflow repo create my-new-repo              # Create public repository
mflow repo create my-private-repo --private # Create private repository
```

## Link Existing Repository

```bash
mflow repo link frontend                    # Auto-detect and link
mflow repo link backend https://github.com/user/backend.git  # Manual URL
```

## Authentication Status

```bash
mflow auth status    # Check if authenticated
mflow auth logout    # Remove stored credentials
```

## Troubleshooting

**"Not authenticated" error:**
- Run `mflow auth token <your-token>`
- Ensure token has `repo` scope

**"Repository already exists" error:**
- Repository name conflicts with existing GitHub repo
- Use `mflow repo link` instead of create

**Permission denied:**
- Check token permissions
- Ensure you have access to the organization (if applicable)
