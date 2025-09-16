# Frequently Asked Questions

## General

**Q: What types of projects work best with MultiFlow?**
A: Any project split across multiple repositories - microservices, frontend/backend splits, monorepo alternatives.

**Q: Does MultiFlow work with existing repositories?**
A: Yes! MultiFlow works with any existing Git repositories. Just run `flow init` in your workspace.

**Q: Can I use MultiFlow without GitHub?**
A: Absolutely. MultiFlow works with local repositories, GitLab, Bitbucket, or any Git remote.

## Setup

**Q: What's the difference between `.flow.yml` and `.multiflow.yml`?**
A: `.multiflow.yml` is the new format (v1.2+) with enhanced features. Old `.flow.yml` files are automatically migrated.

**Q: Can I exclude certain repositories?**
A: Yes! Create a `.multiflowignore` file or use `flow config ignore <repo>` to exclude repositories from operations.

**Q: What if repositories have different default branches?**
A: MultiFlow detects each repository's default branch automatically (main, master, develop, etc.).

## Features

**Q: What happens if a repository doesn't have changes?**
A: MultiFlow skips repositories without changes during commits. They'll show as "untouched" in status.

**Q: Can I work on multiple features simultaneously?**
A: Yes! Each feature is tracked independently:
```bash
flow feature create user-auth
flow feature create payment-system
```

**Q: What if there are merge conflicts?**
A: MultiFlow detects conflicts during `flow feature merge` and warns you. Resolve conflicts manually in each repository.

## Troubleshooting

**Q: "Feature not found" error**
A: The feature wasn't created with MultiFlow. Use `flow feature create <name>` first.

**Q: "Repository not found" error**
A: Run `flow init` to refresh repository detection, or check if the repository path changed.

**Q: Commands seem slow**
A: MultiFlow operates on multiple repositories. Large workspaces or slow Git operations can affect performance.

**Q: Can I undo a feature creation?**
A: Use `flow feature cleanup <name>` to remove feature branches from all repositories.

## GitHub Integration

**Q: Do I need GitHub for MultiFlow to work?**
A: No. GitHub integration is optional for enhanced features like auto-repository creation.

**Q: What permissions does the GitHub token need?**
A: `repo` scope for full repository access. `public_repo` for public repositories only.

**Q: Can I use MultiFlow with GitHub organizations?**
A: Yes, if your token has access to the organization repositories.

## Best Practices

**Q: How should I name features?**
A: Use descriptive, kebab-case names: `user-authentication`, `payment-integration`, `api-refactor`.

**Q: Should I commit to all repositories at once?**
A: Not necessarily. MultiFlow only commits repositories with actual changes.

**Q: How do I handle different repository structures?**
A: MultiFlow is flexible - repositories can have different languages, frameworks, and structures.

## Getting Help

- 📖 Check the [Complete Guide](GUIDE.md)
- 🔧 Review [Commands Reference](COMMANDS.md)
- 🐛 [Report issues](https://github.com/arunprabusiva/multiflow-cli/issues)
- 💬 [Ask questions](https://github.com/arunprabusiva/multiflow-cli/discussions)