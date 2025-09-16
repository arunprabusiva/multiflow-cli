const { Octokit } = require('@octokit/rest');

class GitHubClient {
  constructor(token) {
    this.octokit = new Octokit({ auth: token });
  }

  async createRepo(name, isPrivate = false) {
    return await this.octokit.repos.create({
      name,
      private: isPrivate,
      auto_init: false
    });
  }

  async createPR(owner, repo, head, base, title, body = '') {
    return await this.octokit.pulls.create({
      owner,
      repo,
      title,
      head,
      base,
      body,
      draft: true
    });
  }

  async getPRStatus(owner, repo, prNumber) {
    const pr = await this.octokit.pulls.get({ owner, repo, pull_number: prNumber });
    const checks = await this.octokit.checks.listForRef({ owner, repo, ref: pr.data.head.sha });
    return { pr: pr.data, checks: checks.data };
  }
}

module.exports = GitHubClient;