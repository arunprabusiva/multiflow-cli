const fs = require('fs').promises;
const path = require('path');
const simpleGit = require('simple-git');
const YAML = require('yaml');
const chalk = require('chalk');
const GitHubClient = require('./GitHubClient');
const GitHubAuth = require('./GitHubAuth');
const ConflictDetector = require('./ConflictDetector');
const inquirer = require('inquirer');

class RepoOrch {
  constructor() {
    this.configPath = '.multiflow.yml';
    this.config = null;
    this.github = process.env.GITHUB_TOKEN ? new GitHubClient(process.env.GITHUB_TOKEN) : null;
    this.githubAuth = new GitHubAuth();
  }

  async loadConfig() {
    try {
      const content = await fs.readFile(this.configPath, 'utf8');
      this.config = YAML.parse(content);
    } catch (error) {
      this.config = { repos: {}, features: {} };
    }
  }

  async saveConfig() {
    await fs.writeFile(this.configPath, YAML.stringify(this.config));
  }

  async init(options = {}) {
    await this.loadConfig();
    const repos = await this.scanRepos();
    
    console.log(chalk.blue(`\n🔍 Found ${repos.length} local repositories`));
    
    // Check for missing remotes if createMissing option is enabled
    if (options.createMissing) {
      try {
        await this.handleMissingRemotes(repos);
      } catch (error) {
        console.log(chalk.yellow(`⚠️  GitHub integration skipped: ${error.message}`));
        console.log(chalk.gray('   MultiFlow works great without GitHub integration!'));
      }
    }
    
    this.config.repos = {};
    for (const repo of repos) {
      this.config.repos[repo.name] = {
        path: repo.path,
        hasRemote: repo.hasRemote,
        defaultBranch: repo.defaultBranch,
        privacy: repo.privacy || 'public',
        autoCreate: repo.autoCreate || false
      };
    }
    
    // Initialize workspace settings if not exists
    if (!this.config.workspace) {
      this.config.workspace = {
        name: path.basename(process.cwd()),
        created: new Date().toISOString(),
        defaultPrivacy: 'public',
        autoCreateRepos: false
      };
    }
    
    await this.saveConfig();
    console.log(chalk.green(`\n✅ Workspace initialized with ${repos.length} repositories`));
    
    // Show ignored repos if any
    const ignoredRepos = await this.loadIgnoredRepos();
    if (ignoredRepos.length > 0) {
      console.log(chalk.gray(`   Ignored: ${ignoredRepos.join(', ')} (via .multiflowignore)`));
    }
    
    // Show configuration summary
    this.showInitSummary();
  }

  showInitSummary() {
    console.log(chalk.bold('\n📋 Configuration Summary:'));
    console.log(`Config file: ${chalk.cyan(this.configPath)}`);
    console.log(`Repositories: ${Object.keys(this.config.repos).length}`);
    console.log(`Active features: ${Object.keys(this.config.features).length}`);
    
    const withRemotes = Object.values(this.config.repos).filter(r => r.hasRemote).length;
    const withoutRemotes = Object.keys(this.config.repos).length - withRemotes;
    
    if (withRemotes > 0) {
      console.log(`${chalk.green('✅')} ${withRemotes} repositories with remotes`);
    }
    if (withoutRemotes > 0) {
      console.log(`${chalk.yellow('⚠️')} ${withoutRemotes} repositories without remotes`);
      console.log(chalk.gray('   Use --create-missing to auto-create GitHub repositories'));
    }
  }

  async handleMissingRemotes(repos) {
    const reposWithoutRemotes = repos.filter(repo => !repo.hasRemote);
    
    if (reposWithoutRemotes.length === 0) {
      console.log(chalk.green('✅ All repositories have remotes'));
      return;
    }
    
    console.log(chalk.yellow(`\n⚠️  Found ${reposWithoutRemotes.length} repositories without remotes:`));
    reposWithoutRemotes.forEach(repo => {
      console.log(`   • ${repo.name}`);
    });
    
    const { shouldCreate } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldCreate',
        message: 'Create GitHub repositories for local folders?',
        default: true
      }
    ]);
    
    if (!shouldCreate) {
      return;
    }
    
    // Get privacy preference
    const { defaultPrivacy } = await inquirer.prompt([
      {
        type: 'list',
        name: 'defaultPrivacy',
        message: 'Default privacy for new repositories:',
        choices: [
          { name: 'Public (visible to everyone)', value: 'public' },
          { name: 'Private (only you can see)', value: 'private' }
        ],
        default: 'public'
      }
    ]);
    
    // Create repositories
    for (const repo of reposWithoutRemotes) {
      await this.createGitHubRepository(repo.name, {
        private: defaultPrivacy === 'private',
        description: `${repo.name} repository created by MultiFlow`
      });
    }
  }

  async createGitHubRepository(name, options = {}) {
    try {
      console.log(chalk.blue(`\n🔄 Creating GitHub repository: ${name}`));
      
      const repo = await this.githubAuth.createRepository(name, {
        private: options.private || false,
        description: options.description,
        autoInit: false // We already have local content
      });
      
      // Add remote to local repository
      const git = simpleGit(name);
      await git.addRemote('origin', repo.clone_url);
      
      // Push existing content
      const branches = await git.branchLocal();
      if (branches.current) {
        await git.push('origin', branches.current);
      }
      
      console.log(chalk.green(`✅ Created and linked: ${repo.html_url}`));
      
      return repo;
    } catch (error) {
      console.log(chalk.red(`❌ Failed to create ${name}: ${error.message}`));
      throw error;
    }
  }

  async linkRepository(repoName, remoteUrl) {
    await this.loadConfig();
    
    if (!this.config.repos[repoName]) {
      throw new Error(`Repository '${repoName}' not found in workspace`);
    }
    
    const repoPath = this.config.repos[repoName].path;
    const git = simpleGit(repoPath);
    
    try {
      // Check if remote already exists
      const remotes = await git.getRemotes(true);
      const originExists = remotes.some(remote => remote.name === 'origin');
      
      if (originExists) {
        const { shouldOverwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'shouldOverwrite',
            message: `Repository '${repoName}' already has an origin remote. Overwrite?`,
            default: false
          }
        ]);
        
        if (!shouldOverwrite) {
          console.log(chalk.yellow('Operation cancelled'));
          return;
        }
        
        await git.removeRemote('origin');
      }
      
      // If no remote URL provided, try to create GitHub repo
      if (!remoteUrl) {
        try {
          const user = await this.githubAuth.getAuthenticatedUser();
          const repoExists = await this.githubAuth.repositoryExists(user.login, repoName);
          
          if (!repoExists) {
            const { shouldCreate } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'shouldCreate',
                message: `GitHub repository '${repoName}' doesn't exist. Create it?`,
                default: true
              }
            ]);
            
            if (shouldCreate) {
              const repo = await this.createGitHubRepository(repoName);
              remoteUrl = repo.clone_url;
            } else {
              throw new Error('Cannot link without remote URL');
            }
          } else {
            remoteUrl = `https://github.com/${user.login}/${repoName}.git`;
          }
        } catch (error) {
          throw new Error(`Authentication required. Run: flow auth login`);
        }
      }
      
      // Add remote
      await git.addRemote('origin', remoteUrl);
      
      // Update config
      this.config.repos[repoName].hasRemote = true;
      await this.saveConfig();
      
      console.log(chalk.green(`✅ Linked ${repoName} to ${remoteUrl}`));
      
      // Optionally push existing content
      const branches = await git.branchLocal();
      if (branches.current) {
        const { shouldPush } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'shouldPush',
            message: `Push existing content to remote?`,
            default: true
          }
        ]);
        
        if (shouldPush) {
          await git.push('origin', branches.current);
          console.log(chalk.green(`✅ Pushed ${branches.current} to remote`));
        }
      }
      
    } catch (error) {
      throw new Error(`Failed to link repository: ${error.message}`);
    }
  }

  async scanRepos() {
    const repos = [];
    const items = await fs.readdir('.', { withFileTypes: true });
    const ignoredRepos = await this.loadIgnoredRepos();
    
    for (const item of items) {
      if (item.isDirectory() && !item.name.startsWith('.') && !ignoredRepos.includes(item.name)) {
        const repoPath = item.name;
        const gitPath = path.join(repoPath, '.git');
        
        try {
          await fs.access(gitPath);
          const git = simpleGit(repoPath);
          const remotes = await git.getRemotes(true);
          const defaultBranch = await this.detectDefaultBranch(git);
          
          repos.push({
            name: item.name,
            path: repoPath,
            hasRemote: remotes.length > 0,
            defaultBranch
          });
        } catch (error) {
          // Not a git repo, skip
        }
      }
    }
    
    return repos;
  }

  async loadIgnoredRepos() {
    try {
      const content = await fs.readFile('.multiflowignore', 'utf8');
      return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
    } catch (error) {
      return [];
    }
  }

  async detectDefaultBranch(git) {
    try {
      // Try to get the default branch from remote
      const remotes = await git.getRemotes(true);
      if (remotes.length > 0) {
        try {
          const result = await git.raw(['symbolic-ref', 'refs/remotes/origin/HEAD']);
          return result.trim().split('/').pop();
        } catch (error) {
          // Fall back to local detection
        }
      }
      
      // Check common branch names
      const branches = await git.branchLocal();
      const commonBranches = ['main', 'master', 'develop', 'dev'];
      
      for (const branch of commonBranches) {
        if (branches.all.includes(branch)) {
          return branch;
        }
      }
      
      // Return current branch as fallback
      return branches.current || 'main';
    } catch (error) {
      return 'main'; // Safe default
    }
  }

  async createFeature(featureName, options = {}) {
    await this.loadConfig();
    const branchName = `feature/${featureName}`;
    const targetRepos = this.getTargetRepos(options.repos);
    
    // Check if branch already exists
    const existingBranches = await this.checkBranchExists(branchName, targetRepos);
    if (existingBranches.length > 0) {
      throw new Error(`Branch '${branchName}' already exists in: ${existingBranches.join(', ')}`);
    }
    
    if (options.dryRun) {
      console.log(chalk.blue('🔍 Dry run - would create feature branch:'));
      targetRepos.forEach(repoName => {
        console.log(`  • ${repoName}: ${branchName}`);
      });
      return;
    }
    
    const results = { success: [], failed: [] };
    
    for (const repoName of targetRepos) {
      const repoInfo = this.config.repos[repoName];
      const git = simpleGit(repoInfo.path);
      
      try {
        // Stash if requested and there are changes
        if (options.stash) {
          const status = await git.status();
          if (!status.isClean()) {
            await git.stash(['push', '-m', `MultiFlow auto-stash for ${featureName}`]);
            console.log(`📦 ${repoName}: Stashed uncommitted changes`);
          }
        }
        
        await git.checkoutLocalBranch(branchName);
        if (repoInfo.hasRemote) {
          await git.push('origin', branchName);
        }
        console.log(`✅ ${repoName}: Created branch ${branchName}`);
        results.success.push(repoName);
      } catch (error) {
        console.log(`❌ ${repoName}: ${error.message}`);
        results.failed.push({ repo: repoName, error: error.message });
      }
    }
    
    // Handle partial failures
    if (results.failed.length > 0 && results.success.length > 0) {
      console.log(chalk.yellow(`\n⚠️  Partial success: ${results.success.length}/${targetRepos.length} repositories`));
    }
    
    this.config.features[featureName] = {
      branch: branchName,
      repos: results.success,
      created: new Date().toISOString()
    };
    
    await this.saveConfig();
  }

  getTargetRepos(reposOption) {
    if (reposOption) {
      const specified = reposOption.split(',').map(r => r.trim());
      const available = Object.keys(this.config.repos);
      const invalid = specified.filter(r => !available.includes(r));
      
      if (invalid.length > 0) {
        throw new Error(`Unknown repositories: ${invalid.join(', ')}. Available: ${available.join(', ')}`);
      }
      
      return specified;
    }
    return Object.keys(this.config.repos);
  }

  async checkBranchExists(branchName, targetRepos) {
    const existing = [];
    
    for (const repoName of targetRepos) {
      const repoInfo = this.config.repos[repoName];
      const git = simpleGit(repoInfo.path);
      
      try {
        const branches = await git.branchLocal();
        if (branches.all.includes(branchName)) {
          existing.push(repoName);
        }
      } catch (error) {
        // Ignore errors for branch checking
      }
    }
    
    return existing;
  }

  async commitFeature(featureName, message, options = {}) {
    await this.loadConfig();
    const feature = this.config.features[featureName];
    
    if (!feature) {
      throw new Error(`Feature '${featureName}' not found`);
    }
    
    const targetRepos = options.repos ? 
      this.getTargetRepos(options.repos).filter(r => feature.repos.includes(r)) : 
      feature.repos;
    
    if (options.dryRun) {
      console.log(chalk.blue('🔍 Dry run - would commit changes in:'));
      
      for (const repoName of targetRepos) {
        const repoInfo = this.config.repos[repoName];
        const git = simpleGit(repoInfo.path);
        
        try {
          await git.checkout(feature.branch);
          const status = await git.status();
          
          if (status.files.length > 0) {
            console.log(`  • ${repoName}: ${status.files.length} files to commit`);
          } else {
            console.log(`  • ${repoName}: No changes`);
          }
        } catch (error) {
          console.log(`  • ${repoName}: Error - ${error.message}`);
        }
      }
      return;
    }
    
    for (const repoName of targetRepos) {
      const repoInfo = this.config.repos[repoName];
      const git = simpleGit(repoInfo.path);
      
      try {
        await git.checkout(feature.branch);
        const status = await git.status();
        
        if (status.files.length > 0) {
          await git.add('.');
          await git.commit(message);
          console.log(`✅ ${repoName}: Committed changes`);
        } else {
          console.log(`⚪ ${repoName}: No changes to commit`);
        }
      } catch (error) {
        console.log(`❌ ${repoName}: ${error.message}`);
      }
    }
  }

  async publishFeature(featureName) {
    await this.loadConfig();
    const feature = this.config.features[featureName];
    
    if (!feature) {
      throw new Error(`Feature '${featureName}' not found`);
    }
    
    for (const repoName of feature.repos) {
      const repoInfo = this.config.repos[repoName];
      
      if (repoInfo.hasRemote) {
        const git = simpleGit(repoInfo.path);
        
        try {
          await git.checkout(feature.branch);
          await git.push('origin', feature.branch);
          console.log(`✅ ${repoName}: Published to remote`);
        } catch (error) {
          console.log(`⚠️  ${repoName}: ${error.message}`);
        }
      } else {
        console.log(`⚪ ${repoName}: No remote configured`);
      }
    }
  }

  async cleanupFeature(featureName, options = {}) {
    await this.loadConfig();
    const feature = this.config.features[featureName];
    
    if (!feature) {
      throw new Error(`Feature '${featureName}' not found`);
    }
    
    const targetRepos = options.repos ? 
      this.getTargetRepos(options.repos).filter(r => feature.repos.includes(r)) : 
      feature.repos;
    
    if (options.dryRun) {
      console.log(chalk.blue('🔍 Dry run - would cleanup feature branch:'));
      targetRepos.forEach(repoName => {
        console.log(`  • ${repoName}: Delete ${feature.branch}`);
      });
      return;
    }
    
    for (const repoName of targetRepos) {
      const repoInfo = this.config.repos[repoName];
      const git = simpleGit(repoInfo.path);
      
      try {
        const defaultBranch = repoInfo.defaultBranch || 'main';
        await git.checkout(defaultBranch);
        await git.deleteLocalBranch(feature.branch);
        
        if (repoInfo.hasRemote) {
          await git.push('origin', `:${feature.branch}`);
        }
        
        console.log(`✅ ${repoName}: Cleaned up ${feature.branch}`);
      } catch (error) {
        console.log(`❌ ${repoName}: ${error.message}`);
      }
    }
    
    // Only delete feature if cleaning up all repos
    if (!options.repos) {
      delete this.config.features[featureName];
      await this.saveConfig();
    }
  }

  async mergeFeature(featureName) {
    await this.loadConfig();
    const feature = this.config.features[featureName];
    
    if (!feature) {
      throw new Error(`Feature '${featureName}' not found`);
    }
    
    for (const repoName of feature.repos) {
      const repoInfo = this.config.repos[repoName];
      
      const defaultBranch = repoInfo.defaultBranch || 'main';
      
      // Check for conflicts first
      const conflicts = await ConflictDetector.checkMergeConflicts(repoInfo.path, feature.branch, defaultBranch);
      if (conflicts.hasConflicts) {
        console.log(`⚠️  ${repoName}: Merge conflicts detected`);
        continue;
      }
      
      // Get changed files
      const changedFiles = await ConflictDetector.getChangedFiles(repoInfo.path, feature.branch, defaultBranch);
      if (changedFiles.length === 0) {
        console.log(`⚪ ${repoName}: No changes to merge`);
        continue;
      }
      
      console.log(`✅ ${repoName}: Ready for PR (${changedFiles.length} files changed)`);
    }
  }

  async showStatus(featureName) {
    await this.loadConfig();
    const feature = this.config.features[featureName];
    
    if (!feature) {
      throw new Error(`Feature '${featureName}' not found`);
    }
    
    console.log(chalk.bold(`\n${featureName}`));
    
    for (const repoName of feature.repos) {
      const repoInfo = this.config.repos[repoName];
      const git = simpleGit(repoInfo.path);
      
      try {
        const branches = await git.branchLocal();
        const hasBranch = branches.all.includes(feature.branch);
        const status = hasBranch ? '✅ ready' : '⚪ untouched';
        
        console.log(`├─ ${repoName}: ${feature.branch} ${status}`);
      } catch (error) {
        console.log(`├─ ${repoName}: ❌ error`);
      }
    }
  }

  async showDetailedStatus(featureName) {
    await this.loadConfig();
    const feature = this.config.features[featureName];
    
    if (!feature) {
      throw new Error(`Feature '${featureName}' not found`);
    }
    
    console.log(chalk.bold(`\n📊 ${featureName} - Detailed Status`));
    console.log('='.repeat(50));
    
    for (const repoName of feature.repos) {
      const repoInfo = this.config.repos[repoName];
      const git = simpleGit(repoInfo.path);
      const defaultBranch = repoInfo.defaultBranch || 'main';
      
      try {
        const branches = await git.branchLocal();
        const hasBranch = branches.all.includes(feature.branch);
        
        console.log(`\n📁 ${chalk.bold(repoName)}:`);
        
        if (hasBranch) {
          // Get commit count ahead of default branch
          const commits = await git.raw(['rev-list', '--count', `${defaultBranch}..${feature.branch}`]);
          const commitCount = parseInt(commits.trim());
          
          // Get file changes
          const status = await git.checkout(feature.branch).then(() => git.status());
          
          console.log(`  🌱 Branch: ${chalk.cyan(feature.branch)}`);
          console.log(`  📝 Commits ahead: ${chalk.yellow(commitCount)}`);
          console.log(`  📄 Modified files: ${status.modified.length}`);
          console.log(`  🆕 New files: ${status.not_added.length}`);
          console.log(`  🟢 Status: ${chalk.green('Ready')}`);
        } else {
          console.log(`  ⚪ Status: ${chalk.gray('Untouched')}`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
  }

  async checkoutAll(branch) {
    await this.loadConfig();
    
    // Check if it's a feature name
    const feature = this.config.features[branch];
    const targetBranch = feature ? feature.branch : branch;
    
    for (const [repoName, repoInfo] of Object.entries(this.config.repos)) {
      const git = simpleGit(repoInfo.path);
      
      try {
        await git.checkout(targetBranch);
        console.log(`✅ ${repoName}: Switched to ${targetBranch}`);
      } catch (error) {
        console.log(`⚠️  ${repoName}: ${error.message}`);
      }
    }
  }

  async showDiff(featureName, options = {}) {
    await this.loadConfig();
    const feature = this.config.features[featureName];
    
    if (!feature) {
      throw new Error(`Feature '${featureName}' not found`);
    }
    
    console.log(chalk.bold(`\n📋 Changes for ${featureName}`));
    console.log('='.repeat(40));
    
    for (const repoName of feature.repos) {
      const repoInfo = this.config.repos[repoName];
      const git = simpleGit(repoInfo.path);
      const defaultBranch = repoInfo.defaultBranch || 'main';
      
      try {
        console.log(chalk.bold(`\n📁 ${repoName}:`));
        
        if (options.summary) {
          const diff = await git.diffSummary([defaultBranch, feature.branch]);
          console.log(`  Files changed: ${diff.files.length}`);
          console.log(`  Insertions: ${chalk.green('+' + diff.insertions)}`);
          console.log(`  Deletions: ${chalk.red('-' + diff.deletions)}`);
        } else {
          const changedFiles = await git.diff(['--name-only', defaultBranch, feature.branch]);
          if (changedFiles.trim()) {
            console.log(`  Changed files:`);
            changedFiles.trim().split('\n').forEach(file => {
              console.log(`    • ${file}`);
            });
          } else {
            console.log(`  ⚪ No changes`);
          }
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
  }

  async doctor() {
    await this.loadConfig();
    
    console.log(chalk.bold('🏥 Workspace Health Check'));
    console.log('========================\n');
    
    let healthyCount = 0;
    let totalRepos = Object.keys(this.config.repos).length;
    
    for (const [repoName, repoInfo] of Object.entries(this.config.repos)) {
      const git = simpleGit(repoInfo.path);
      let isHealthy = true;
      
      console.log(chalk.bold(`📁 ${repoName}:`));
      
      try {
        // Check for uncommitted changes
        const status = await git.status();
        if (!status.isClean()) {
          console.log(`  ⚠️  Uncommitted changes: ${status.files.length} files`);
          isHealthy = false;
        } else {
          console.log(`  ✅ Working directory clean`);
        }
        
        // Check current branch
        const branch = await git.branchLocal();
        console.log(`  🌱 Current branch: ${chalk.cyan(branch.current)}`);
        
        // Check for unpushed commits (if has remote)
        if (repoInfo.hasRemote) {
          try {
            const ahead = await git.raw(['rev-list', '--count', 'HEAD', '^origin/HEAD']);
            const aheadCount = parseInt(ahead.trim());
            if (aheadCount > 0) {
              console.log(`  ⚠️  Unpushed commits: ${aheadCount}`);
              isHealthy = false;
            } else {
              console.log(`  ✅ Up to date with remote`);
            }
          } catch (error) {
            console.log(`  ⚠️  Cannot check remote status`);
          }
        } else {
          console.log(`  💻 Local repository (no remote)`);
        }
        
        if (isHealthy) {
          console.log(`  🟢 Overall: ${chalk.green('Healthy')}`);
          healthyCount++;
        } else {
          console.log(`  🟡 Overall: ${chalk.yellow('Needs attention')}`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        console.log(`  🔴 Overall: ${chalk.red('Unhealthy')}`);
      }
      
      console.log('');
    }
    
    // Summary
    console.log(chalk.bold('📊 Summary:'));
    console.log(`Healthy repositories: ${chalk.green(healthyCount)}/${totalRepos}`);
    
    if (healthyCount === totalRepos) {
      console.log(chalk.green('✅ All repositories are healthy!'));
    } else {
      console.log(chalk.yellow('⚠️  Some repositories need attention'));
    }
  }

  async showConfig() {
    await this.loadConfig();
    
    console.log(chalk.bold('\n📄 Workspace Configuration'));
    console.log('========================\n');
    
    console.log(chalk.bold('Repositories:'));
    for (const [name, info] of Object.entries(this.config.repos)) {
      console.log(`├─ ${name}:`);
      console.log(`│  ├─ Path: ${info.path}`);
      console.log(`│  ├─ Default Branch: ${chalk.cyan(info.defaultBranch || 'main')}`);
      console.log(`│  └─ Remote: ${info.hasRemote ? '✅ Yes' : '⚪ No'}`);
    }
    
    console.log('\n' + chalk.bold('Active Features:'));
    const featureCount = Object.keys(this.config.features).length;
    if (featureCount === 0) {
      console.log('⚪ No active features');
    } else {
      for (const [name, info] of Object.entries(this.config.features)) {
        console.log(`├─ ${name}: ${info.branch}`);
      }
    }
  }

  async setDefaultBranch(repoName, branchName) {
    await this.loadConfig();
    
    if (!this.config.repos[repoName]) {
      throw new Error(`Repository '${repoName}' not found`);
    }
    
    this.config.repos[repoName].defaultBranch = branchName;
    await this.saveConfig();
  }

  async ignoreRepository(repoName) {
    const ignoredRepos = await this.loadIgnoredRepos();
    
    if (ignoredRepos.includes(repoName)) {
      throw new Error(`Repository '${repoName}' is already ignored`);
    }
    
    ignoredRepos.push(repoName);
    await this.saveIgnoredRepos(ignoredRepos);
  }

  async unignoreRepository(repoName) {
    const ignoredRepos = await this.loadIgnoredRepos();
    
    if (!ignoredRepos.includes(repoName)) {
      throw new Error(`Repository '${repoName}' is not ignored`);
    }
    
    const filtered = ignoredRepos.filter(repo => repo !== repoName);
    await this.saveIgnoredRepos(filtered);
  }

  async saveIgnoredRepos(ignoredRepos) {
    const content = [
      '# MultiFlow ignore file',
      '# Add repository names (one per line) to exclude from operations',
      '# Lines starting with # are comments',
      '',
      ...ignoredRepos
    ].join('\n');
    
    await fs.writeFile('.multiflowignore', content);
  }
}

module.exports = RepoOrch;