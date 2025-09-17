const { Octokit } = require('@octokit/rest');
const http = require('http');
const url = require('url');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class GitHubAuth {
  constructor() {
    this.clientId = 'Ov23liOGJJGJGJGJGJGJ'; // Replace with actual GitHub App client ID
    this.tokenPath = path.join(os.homedir(), '.multiflow', 'github-token');
    this.octokit = null;
  }

  async ensureTokenDir() {
    const tokenDir = path.dirname(this.tokenPath);
    try {
      await fs.mkdir(tokenDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  async saveToken(token) {
    await this.ensureTokenDir();
    await fs.writeFile(this.tokenPath, token, { mode: 0o600 });
  }

  async loadToken() {
    try {
      return await fs.readFile(this.tokenPath, 'utf8');
    } catch (error) {
      return null;
    }
  }

  async deleteToken() {
    try {
      await fs.unlink(this.tokenPath);
    } catch (error) {
      // Token file doesn't exist
    }
  }

  async login() {
    console.log(chalk.yellow('📝 GitHub OAuth login not yet available.'));
    console.log('Please use: mflow auth token <your-github-token>');
    console.log('');
    console.log('To get a token:');
    console.log('1. Go to https://github.com/settings/tokens');
    console.log('2. Generate new token with "repo" scope');
    console.log('3. Run: mflow auth token <your-token>');
    
    throw new Error('Use personal access token for now');
  }

  async loginWithToken(token) {
    try {
      this.octokit = new Octokit({ auth: token });
      
      // Verify token works
      const { data: user } = await this.octokit.rest.users.getAuthenticated();
      
      await this.saveToken(token);
      
      console.log(chalk.green(`✅ Authenticated as ${user.name || user.login}`));
      return { token, user };
    } catch (error) {
      throw new Error(`Invalid GitHub token: ${error.message}`);
    }
  }

  async logout() {
    await this.deleteToken();
    this.octokit = null;
    console.log(chalk.green('✅ Logged out successfully'));
  }

  async getAuthenticatedUser() {
    const token = await this.loadToken();
    if (!token) {
      throw new Error('Not authenticated. Run: mflow auth login');
    }

    if (!this.octokit) {
      this.octokit = new Octokit({ auth: token });
    }

    try {
      const { data: user } = await this.octokit.rest.users.getAuthenticated();
      return user;
    } catch (error) {
      throw new Error('Authentication expired. Please login again: mflow auth login');
    }
  }

  async createRepository(name, options = {}) {
    if (!this.octokit) {
      const token = await this.loadToken();
      if (!token) {
        throw new Error('Not authenticated. Run: mflow auth login');
      }
      this.octokit = new Octokit({ auth: token });
    }

    try {
      const { data: repo } = await this.octokit.rest.repos.createForAuthenticatedUser({
        name,
        description: options.description || `Repository created by MultiFlow`,
        private: options.private || false,
        auto_init: options.autoInit || true,
        gitignore_template: options.gitignoreTemplate,
        license_template: options.licenseTemplate
      });

      return repo;
    } catch (error) {
      if (error.status === 422) {
        throw new Error(`Repository '${name}' already exists`);
      }
      throw new Error(`Failed to create repository: ${error.message}`);
    }
  }

  async repositoryExists(owner, name) {
    if (!this.octokit) {
      const token = await this.loadToken();
      if (!token) {
        return false;
      }
      this.octokit = new Octokit({ auth: token });
    }

    try {
      await this.octokit.rest.repos.get({ owner, repo: name });
      return true;
    } catch (error) {
      return false;
    }
  }

  getOctokit() {
    return this.octokit;
  }
}

module.exports = GitHubAuth;