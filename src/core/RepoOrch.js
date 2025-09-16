const fs = require('fs').promises;
const path = require('path');
const simpleGit = require('simple-git');
const YAML = require('yaml');
const chalk = require('chalk');
const GitHubClient = require('./GitHubClient');
const ConflictDetector = require('./ConflictDetector');

class RepoOrch {
  constructor() {
    this.configPath = '.flow.yml';
    this.config = null;
    this.github = process.env.GITHUB_TOKEN ? new GitHubClient(process.env.GITHUB_TOKEN) : null;
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

  async init() {
    await this.loadConfig();
    const repos = await this.scanRepos();
    
    this.config.repos = {};
    for (const repo of repos) {
      this.config.repos[repo.name] = {
        path: repo.path,
        hasRemote: repo.hasRemote,
        defaultBranch: repo.defaultBranch
      };
    }
    
    await this.saveConfig();
    console.log(`Found ${repos.length} repositories`);
  }

  async scanRepos() {
    const repos = [];
    const items = await fs.readdir('.', { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory() && !item.name.startsWith('.')) {
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

  async createFeature(featureName) {
    await this.loadConfig();
    const branchName = `feature/${featureName}`;
    
    for (const [repoName, repoInfo] of Object.entries(this.config.repos)) {
      const git = simpleGit(repoInfo.path);
      
      try {
        await git.checkoutLocalBranch(branchName);
        if (repoInfo.hasRemote) {
          await git.push('origin', branchName);
        }
        console.log(`✅ ${repoName}: Created branch ${branchName}`);
      } catch (error) {
        console.log(`⚠️  ${repoName}: ${error.message}`);
      }
    }
    
    this.config.features[featureName] = {
      branch: branchName,
      repos: Object.keys(this.config.repos),
      created: new Date().toISOString()
    };
    
    await this.saveConfig();
  }

  async commitFeature(featureName, message) {
    await this.loadConfig();
    const feature = this.config.features[featureName];
    
    if (!feature) {
      throw new Error(`Feature '${featureName}' not found`);
    }
    
    for (const repoName of feature.repos) {
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
        console.log(`⚠️  ${repoName}: ${error.message}`);
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

  async cleanupFeature(featureName) {
    await this.loadConfig();
    const feature = this.config.features[featureName];
    
    if (!feature) {
      throw new Error(`Feature '${featureName}' not found`);
    }
    
    for (const repoName of feature.repos) {
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
        console.log(`⚠️  ${repoName}: ${error.message}`);
      }
    }
    
    delete this.config.features[featureName];
    await this.saveConfig();
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

  async setDefaultBranch(repoName, branchName) {
    await this.loadConfig();
    
    if (!this.config.repos[repoName]) {
      throw new Error(`Repository '${repoName}' not found`);
    }
    
    this.config.repos[repoName].defaultBranch = branchName;
    await this.saveConfig();
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
}

module.exports = RepoOrch;