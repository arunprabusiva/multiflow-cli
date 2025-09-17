# 🤝 Contributing to MultiFlow

Thank you for your interest in contributing to MultiFlow! This document provides guidelines for contributing to the project.

## 🚀 Quick Start for Contributors

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/multiflow.git
   cd multiflow
   ```
3. **Install dependencies**
   ```bash
   npm install
   npm link
   ```
4. **Run tests**
   ```bash
   # Linux/Mac
   ./test-multiflow.sh
   
   # Windows
   test-multiflow.bat
   ```

## 🐛 Reporting Issues

When reporting issues, please include:
- Multimflow version (`mflow --version`)
- Operating system
- Node.js version (`node --version`)
- Git version (`git --version`)
- Steps to reproduce
- Expected vs actual behavior
- Error messages (if any)

## 💡 Suggesting Features

We welcome feature suggestions! Please:
1. Check existing issues first
2. Describe the use case
3. Explain why it would be valuable
4. Provide examples if possible

## 🔧 Development Guidelines

### Code Style
- Use 2 spaces for indentation
- Follow existing naming conventions
- Add comments for complex logic
- Keep functions small and focused

### Testing
- Test your changes with the provided test scripts
- Add new test cases for new features
- Ensure all existing tests pass

### Commit Messages
Use clear, descriptive commit messages:
```bash
# Good
git commit -m "Add conflict detection for merge command"
git commit -m "Fix branch cleanup on Windows"

# Avoid
git commit -m "fix bug"
git commit -m "updates"
```

## 📝 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding guidelines
   - Add tests if applicable
   - Update documentation

3. **Test thoroughly**
   ```bash
   # Run the test script
   ./test-multiflow.sh
   
   # Test manually with different scenarios
   ```

4. **Submit pull request**
   - Provide clear description
   - Reference related issues
   - Include screenshots if UI changes

## 🏗️ Project Structure

```
multiflow/
├── src/
│   ├── cli.js              # Main CLI entry point
│   └── core/
│       ├── RepoOrch.js     # Core orchestration logic
│       ├── GitHubClient.js # GitHub API integration
│       └── ConflictDetector.js # Merge conflict detection
├── test-multiflow.sh       # Linux/Mac test script
├── test-multiflow.bat      # Windows test script
├── README.md               # Main documentation
├── USER_GUIDE.md           # Detailed user guide
└── package.json            # Dependencies and scripts
```

## 🎯 Areas for Contribution

### High Priority
- [ ] GitHub API integration for PR creation
- [ ] Better error handling and recovery
- [ ] Support for different Git hosting providers
- [ ] Configuration validation

### Medium Priority
- [ ] Selective repository operations
- [ ] Custom branch naming patterns
- [ ] Integration with popular CI/CD systems
- [ ] Performance optimizations

### Nice to Have
- [ ] Web UI for status monitoring
- [ ] AI-powered commit message suggestions
- [ ] Plugin system for extensibility
- [ ] Docker support

## 🧪 Testing Your Changes

### Manual Testing Checklist
- [ ] `mflow init` works in empty directory
- [ ] `mflow init` works with existing repos
- [ ] Feature creation works across all repos
- [ ] Commit works with staged changes
- [ ] Status shows correct information
- [ ] Merge detection works properly
- [ ] Cleanup removes branches correctly
- [ ] Multiple features work simultaneously

### Edge Cases to Test
- [ ] Repositories without remotes
- [ ] Mixed remote/local repositories
- [ ] Repositories with existing feature branches
- [ ] Empty repositories
- [ ] Repositories with uncommitted changes

## 📚 Resources

- [Git Documentation](https://git-scm.com/doc)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Commander.js Documentation](https://github.com/tj/commander.js)
- [Simple Git Documentation](https://github.com/steveukx/git-js)

## 🆘 Getting Help

- **Questions**: Open a [Discussion](https://github.com/your-username/multiflow/discussions)
- **Bugs**: Create an [Issue](https://github.com/your-username/multiflow/issues)
- **Chat**: Join our community (link coming soon)

## 📄 License

By contributing to MultiFlow, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to MultiFlow! 🌊**
