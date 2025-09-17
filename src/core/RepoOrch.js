const fs = require('fs').promises;
const path = require('path');
const simpleGit = require('simple-git');
const YAML = require('yaml');
const chalk = require('chalk');
const ConflictDetector = require('./ConflictDetector');

class RepoOrch {
  constructor() {
    this.configPath = '.flow.yml';
    this.config = null;
    this.github = null; // GitHub integration disabled for now
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
        const status = hasBranch ? '✅ ready' : '⬜ untouched';
        
        console.log(`├─ ${repoName}: ${feature.branch} ${status}`);
      } catch (error) {
        console.log(`├─ ${repoName}: ❌ error`);
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
    
    for (const [repoName, repoInfo] of Object.entries(this.config.repos)) {
      const git = simpleGit(repoInfo.path);
      
      try {
        await git.checkout(branch);
        console.log(`✅ ${repoName}: Switched to ${branch}`);
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
    
    console.log(chalk.bold(`\n📈 Cross-Repository Changes Summary`));
    console.log(`Feature: ${featureName} vs main\n`);
    
    for (const repoName of feature.repos) {
      const repoInfo = this.config.repos[repoName];
      const defaultBranch = repoInfo.defaultBranch || 'main';
      
      try {
        const changedFiles = await ConflictDetector.getChangedFiles(repoInfo.path, feature.branch, defaultBranch);
        if (changedFiles.length > 0) {
          console.log(`📁 ${repoName}: ${changedFiles.length} files changed`);
          if (!options.summary) {
            changedFiles.forEach(file => console.log(`   - ${file}`));
          }
        } else {
          console.log(`⚪ ${repoName}: No changes`);
        }
      } catch (error) {
        console.log(`❌ ${repoName}: Error reading diff`);
      }
    }
  }

  async doctor() {
    await this.loadConfig();
    
    console.log(chalk.bold('\n🏥 Workspace Health Check'));
    console.log('========================\n');
    
    let healthyRepos = 0;
    let totalRepos = Object.keys(this.config.repos).length;
    
    for (const [repoName, repoInfo] of Object.entries(this.config.repos)) {
      const git = simpleGit(repoInfo.path);
      
      try {
        const status = await git.status();
        const isClean = status.files.length === 0;
        
        console.log(`${isClean ? '✅' : '⚠️ '} ${repoName}: ${isClean ? 'Clean working directory' : `${status.files.length} uncommitted changes`}`);
        
        if (isClean) healthyRepos++;
      } catch (error) {
        console.log(`❌ ${repoName}: Git error - ${error.message}`);
      }
    }
    
    console.log(`\n📊 Health Score: ${healthyRepos}/${totalRepos} repositories healthy`);
    
    if (healthyRepos === totalRepos) {
      console.log(chalk.green('🎯 Workspace is healthy - ready for development!'));
    } else {
      console.log(chalk.yellow('⚠️  Some repositories need attention'));
    }
  }
}

module.exports = RepoOrch;