const fs = require('fs').promises;
const path = require('path');
const simpleGit = require('simple-git');
const YAML = require('yaml');
const chalk = require('chalk');
const ConflictDetector = require('./ConflictDetector');
const GitHubAuth = require('./GitHubAuth');

class RepoOrch {
  constructor() {
    this.configPath = '.flow.yml';
    this.config = null;
    this.githubAuth = new GitHubAuth();
  }

  async loadConfig() {
    try {
      const content = await fs.readFile(this.configPath, 'utf8');
      this.config = YAML.parse(content);
    } catch (error) {
      this.config = { repos: {}, features: {}, profiles: {}, settings: { activeProfile: 'default' } };
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
    const activeRepos = this.getActiveRepos();
    
    for (const [repoName, repoInfo] of Object.entries(activeRepos)) {
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
      repos: Object.keys(activeRepos),
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
    
    const activeProfile = this.config.settings?.activeProfile || 'default';
    const activeRepos = this.getActiveRepos();
    
    console.log(chalk.bold('\n📄 Workspace Configuration'));
    console.log('========================\n');
    
    console.log(chalk.bold(`Active Profile: ${chalk.cyan(activeProfile)}`));
    console.log(`Active Repositories: ${Object.keys(activeRepos).length}/${Object.keys(this.config.repos).length}\n`);
    
    console.log(chalk.bold('Repositories:'));
    for (const [name, info] of Object.entries(this.config.repos)) {
      const isActive = activeRepos[name] ? '✅' : '⚪';
      console.log(`${isActive} ${name}:`);
      console.log(`   ├─ Path: ${info.path}`);
      console.log(`   ├─ Default Branch: ${chalk.cyan(info.defaultBranch || 'main')}`);
      console.log(`   └─ Remote: ${info.hasRemote ? '✅ Yes' : '⚪ No'}`);
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
    const activeRepos = this.getActiveRepos();
    let totalRepos = Object.keys(activeRepos).length;
    
    for (const [repoName, repoInfo] of Object.entries(activeRepos)) {
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

  getActiveRepos() {
    const activeProfile = this.config.settings?.activeProfile || 'default';
    const profile = this.config.profiles?.[activeProfile];
    
    if (!profile || !profile.repos) {
      return this.config.repos;
    }
    
    const activeRepos = {};
    for (const repoName of profile.repos) {
      if (this.config.repos[repoName]) {
        activeRepos[repoName] = this.config.repos[repoName];
      }
    }
    return activeRepos;
  }

  async createProfile(profileName, repoNames = []) {
    await this.loadConfig();
    
    this.config.profiles = this.config.profiles || {};
    this.config.profiles[profileName] = {
      repos: repoNames.length > 0 ? repoNames : Object.keys(this.config.repos),
      created: new Date().toISOString()
    };
    
    await this.saveConfig();
    console.log(`✅ Profile '${profileName}' created with ${this.config.profiles[profileName].repos.length} repositories`);
  }

  async switchProfile(profileName) {
    await this.loadConfig();
    
    if (!this.config.profiles?.[profileName]) {
      throw new Error(`Profile '${profileName}' not found`);
    }
    
    this.config.settings = this.config.settings || {};
    this.config.settings.activeProfile = profileName;
    
    await this.saveConfig();
    console.log(`✅ Switched to profile '${profileName}'`);
  }

  async pullAll() {
    await this.loadConfig();
    const activeRepos = this.getActiveRepos();
    
    for (const [repoName, repoInfo] of Object.entries(activeRepos)) {
      if (!repoInfo.hasRemote) {
        console.log(`⚪ ${repoName}: No remote configured`);
        continue;
      }
      
      const git = simpleGit(repoInfo.path);
      
      try {
        await git.pull();
        console.log(`✅ ${repoName}: Pulled latest changes`);
      } catch (error) {
        console.log(`⚠️  ${repoName}: ${error.message}`);
      }
    }
  }

  async pushAll() {
    await this.loadConfig();
    const activeRepos = this.getActiveRepos();
    
    for (const [repoName, repoInfo] of Object.entries(activeRepos)) {
      if (!repoInfo.hasRemote) {
        console.log(`⚪ ${repoName}: No remote configured`);
        continue;
      }
      
      const git = simpleGit(repoInfo.path);
      
      try {
        const status = await git.status();
        if (status.ahead > 0) {
          await git.push();
          console.log(`✅ ${repoName}: Pushed ${status.ahead} commits`);
        } else {
          console.log(`⚪ ${repoName}: Nothing to push`);
        }
      } catch (error) {
        console.log(`⚠️  ${repoName}: ${error.message}`);
      }
    }
  }

  async createPRs(featureName, title, body = '') {
    await this.loadConfig();
    const feature = this.config.features[featureName];
    
    if (!feature) {
      throw new Error(`Feature '${featureName}' not found`);
    }
    
    console.log(chalk.bold(`\n🔀 Creating Pull Requests for '${featureName}'`));
    console.log('===============================================\n');
    
    for (const repoName of feature.repos) {
      const repoInfo = this.config.repos[repoName];
      
      if (!repoInfo.hasRemote) {
        console.log(`⚪ ${repoName}: No remote configured`);
        continue;
      }
      
      const defaultBranch = repoInfo.defaultBranch || 'main';
      const git = simpleGit(repoInfo.path);
      
      try {
        // Check if there are changes
        const changedFiles = await ConflictDetector.getChangedFiles(repoInfo.path, feature.branch, defaultBranch);
        if (changedFiles.length === 0) {
          console.log(`⚪ ${repoName}: No changes to create PR`);
          continue;
        }
        
        // Get remote URL for PR creation instructions
        const remotes = await git.getRemotes(true);
        const originUrl = remotes.find(r => r.name === 'origin')?.refs?.fetch;
        
        if (originUrl) {
          const prUrl = this.generatePRUrl(originUrl, feature.branch, defaultBranch, title, body);
          console.log(`🔗 ${repoName}: Create PR at:`);
          console.log(`   ${prUrl}`);
        } else {
          console.log(`⚠️  ${repoName}: Could not determine remote URL`);
        }
      } catch (error) {
        console.log(`❌ ${repoName}: Error - ${error.message}`);
      }
    }
  }

  generatePRUrl(remoteUrl, sourceBranch, targetBranch, title, body) {
    // Convert SSH/HTTPS URLs to web URLs
    let webUrl = remoteUrl
      .replace(/^git@github\.com:/, 'https://github.com/')
      .replace(/\.git$/, '');
    
    const params = new URLSearchParams({
      expand: '1',
      title: title,
      body: body
    });
    
    return `${webUrl}/compare/${targetBranch}...${sourceBranch}?${params.toString()}`;
  }

  async listProfiles() {
    await this.loadConfig();
    
    const profiles = this.config.profiles || {};
    const activeProfile = this.config.settings?.activeProfile || 'default';
    
    console.log(chalk.bold('\n📁 Available Profiles'));
    console.log('===================\n');
    
    if (Object.keys(profiles).length === 0) {
      console.log('⚪ No profiles created yet');
      console.log('Create one with: flow profile create <name>');
      return;
    }
    
    for (const [name, profile] of Object.entries(profiles)) {
      const isActive = name === activeProfile;
      const indicator = isActive ? '✅' : '⚪';
      console.log(`${indicator} ${name} (${profile.repos.length} repos)${isActive ? ' ← active' : ''}`);
    }
  }

  async showProfile(profileName) {
    await this.loadConfig();
    
    const profile = this.config.profiles?.[profileName];
    if (!profile) {
      throw new Error(`Profile '${profileName}' not found`);
    }
    
    const isActive = profileName === (this.config.settings?.activeProfile || 'default');
    
    console.log(chalk.bold(`\n📁 Profile: ${profileName}${isActive ? ' (active)' : ''}`));
    console.log('========================\n');
    
    console.log(chalk.bold('Repositories:'));
    for (const repoName of profile.repos) {
      const repoInfo = this.config.repos[repoName];
      if (repoInfo) {
        console.log(`✅ ${repoName} (${repoInfo.path})`);
      } else {
        console.log(`❌ ${repoName} (not found)`);
      }
    }
    
    console.log(`\nCreated: ${new Date(profile.created).toLocaleString()}`);
  }

  async deleteProfile(profileName) {
    await this.loadConfig();
    
    if (!this.config.profiles?.[profileName]) {
      throw new Error(`Profile '${profileName}' not found`);
    }
    
    const activeProfile = this.config.settings?.activeProfile || 'default';
    if (profileName === activeProfile) {
      throw new Error(`Cannot delete active profile '${profileName}'. Switch to another profile first.`);
    }
    
    const profile = this.config.profiles[profileName];
    console.log(`\nProfile '${profileName}' contains ${profile.repos.length} repositories:`);
    console.log(`${profile.repos.join(', ')}\n`);
    
    const inquirer = require('inquirer');
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to delete profile '${profileName}'?`,
        default: false
      }
    ]);
    
    if (!confirm) {
      console.log('⚪ Profile deletion cancelled');
      return;
    }
    
    delete this.config.profiles[profileName];
    await this.saveConfig();
    
    console.log(`✅ Profile '${profileName}' deleted`);
  }

  // GitHub Authentication Methods
  async githubLogin() {
    try {
      await this.githubAuth.login();
    } catch (error) {
      throw error;
    }
  }

  async githubLoginWithToken(token) {
    try {
      const result = await this.githubAuth.loginWithToken(token);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async githubLogout() {
    try {
      await this.githubAuth.logout();
    } catch (error) {
      throw error;
    }
  }

  async githubAuthStatus() {
    try {
      const user = await this.githubAuth.getAuthenticatedUser();
      console.log(chalk.green(`✅ Authenticated as ${user.name || user.login}`));
      console.log(chalk.gray(`   Email: ${user.email || 'Not public'}`));
      console.log(chalk.gray(`   Profile: ${user.html_url}`));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Not authenticated'));
      console.log(chalk.gray('   Run: flow auth token <your-token>'));
    }
  }
}

module.exports = RepoOrch;