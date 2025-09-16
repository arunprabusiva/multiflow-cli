const { Octokit } = require('@octokit/rest');
const open = require('open');
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
    console.log(chalk.blue('🔐 GitHub OAuth Login'));
    console.log('Opening browser for GitHub authentication...\n');

    return new Promise((resolve, reject) => {
      const server = http.createServer(async (req, res) => {
        const parsedUrl = url.parse(req.url, true);
        
        if (parsedUrl.pathname === '/callback') {
          const { code, error } = parsedUrl.query;
          
          if (error) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <body>
                  <h1>❌ Authentication Failed</h1>
                  <p>Error: ${error}</p>
                  <p>You can close this window.</p>
                </body>
              </html>
            `);
            server.close();
            reject(new Error(`GitHub OAuth error: ${error}`));
            return;
          }

          if (code) {
            try {
              // Exchange code for token
              const token = await this.exchangeCodeForToken(code);
              await this.saveToken(token);
              
              // Initialize Octokit with token
              this.octokit = new Octokit({ auth: token });
              
              // Get user info
              const { data: user } = await this.octokit.rest.users.getAuthenticated();
              
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(`
                <html>
                  <body>
                    <h1>✅ Authentication Successful!</h1>
                    <p>Welcome, ${user.name || user.login}!</p>
                    <p>You can close this window and return to your terminal.</p>
                  </body>
                </html>
              `);
              
              server.close();
              resolve({ token, user });
            } catch (error) {
              res.writeHead(500, { 'Content-Type': 'text/html' });
              res.end(`
                <html>
                  <body>
                    <h1>❌ Token Exchange Failed</h1>
                    <p>Error: ${error.message}</p>
                    <p>You can close this window.</p>
                  </body>
                </html>
              `);
              server.close();
              reject(error);
            }
          }
        } else {
          res.writeHead(404);
          res.end('Not found');
        }
      });

      server.listen(8080, () => {
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&scope=repo,user&redirect_uri=http://localhost:8080/callback`;
        open(authUrl);
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        server.close();
        reject(new Error('Authentication timeout'));
      }, 300000);
    });
  }

  async exchangeCodeForToken(code) {
    // This would normally exchange the code for a token via GitHub's OAuth API
    // For now, we'll use a personal access token approach
    throw new Error('OAuth flow requires GitHub App setup. Please use: flow auth token <your-token>');
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
      throw new Error('Not authenticated. Run: flow auth login');
    }

    if (!this.octokit) {
      this.octokit = new Octokit({ auth: token });
    }

    try {
      const { data: user } = await this.octokit.rest.users.getAuthenticated();
      return user;
    } catch (error) {
      throw new Error('Authentication expired. Please login again: flow auth login');
    }
  }

  async createRepository(name, options = {}) {
    if (!this.octokit) {
      const token = await this.loadToken();
      if (!token) {
        throw new Error('Not authenticated. Run: flow auth login');
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