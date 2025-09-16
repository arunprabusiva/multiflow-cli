#!/usr/bin/env node

const { Command } = require('commander');
const RepoOrch = require('./core/RepoOrch');
const chalk = require('chalk');

const program = new Command();
const repoOrch = new RepoOrch();

program
  .name('flow')
  .description('Multi-repo workflow orchestration CLI')
  .version('1.1.0');

program
  .command('about')
  .description('Show information about MultiFlow')
  .action(() => {
    console.log(chalk.cyan('🌊 MultiFlow - Multi-Repo Workflow CLI'));
    console.log(chalk.gray('Version: 1.1.0'));
    console.log(chalk.gray('Created by: Arunprabu Sivapprakasam'));
    console.log(chalk.gray('GitHub: https://github.com/arunprabusiva/multiflow-cli'));
    console.log(chalk.gray('License: MIT'));
    console.log('');
    console.log(chalk.yellow('✨ Streamline feature development across multiple repositories'));
  });

program
  .command('auth')
  .description('GitHub authentication commands')
  .addCommand(
    new Command('login')
      .description('Login to GitHub (browser-based OAuth)')
      .action(async () => {
        try {
          const result = await repoOrch.githubAuth.login();
          console.log(chalk.green(`✅ Successfully authenticated as ${result.user.name || result.user.login}`));
        } catch (error) {
          console.error(chalk.red('❌ Authentication failed:', error.message));
        }
      })
  )
  .addCommand(
    new Command('token')
      .description('Login with personal access token')
      .argument('<token>', 'GitHub personal access token')
      .action(async (token) => {
        try {
          await repoOrch.githubAuth.loginWithToken(token);
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  )
  .addCommand(
    new Command('logout')
      .description('Logout from GitHub')
      .action(async () => {
        try {
          await repoOrch.githubAuth.logout();
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  )
  .addCommand(
    new Command('status')
      .description('Show authentication status')
      .action(async () => {
        try {
          const user = await repoOrch.githubAuth.getAuthenticatedUser();
          console.log(chalk.green(`✅ Authenticated as ${user.name || user.login}`));
          console.log(chalk.gray(`   Email: ${user.email || 'Not public'}`);
          console.log(chalk.gray(`   Profile: ${user.html_url}`));
        } catch (error) {
          console.log(chalk.yellow('⚠️  Not authenticated'));
          console.log(chalk.gray('   Run: flow auth login'));
        }
      })
  );

program
  .command('init')
  .description('Initialize workspace and scan for repositories')
  .option('--create-missing', 'Create GitHub repositories for local folders without remotes')
  .action(async (options) => {
    try {
      await repoOrch.init(options);
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
    }
  });

program
  .command('feature')
  .description('Feature management commands')
  .addCommand(
    new Command('create')
      .description('Create feature branch across repos')
      .argument('<name>', 'Feature name')
      .action(async (name) => {
        try {
          await repoOrch.createFeature(name);
          console.log(chalk.green(`✅ Feature '${name}' created across all repos`));
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  )
  .addCommand(
    new Command('commit')
      .description('Commit changes across repos')
      .argument('<name>', 'Feature name')
      .option('-m, --message <message>', 'Commit message', 'Update feature')
      .action(async (name, options) => {
        try {
          await repoOrch.commitFeature(name, options.message);
          console.log(chalk.green(`✅ Changes committed for feature '${name}'`));
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  )
  .addCommand(
    new Command('publish')
      .description('Publish feature branch')
      .argument('<name>', 'Feature name')
      .action(async (name) => {
        try {
          await repoOrch.publishFeature(name);
          console.log(chalk.green(`✅ Feature '${name}' published`));
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  )
  .addCommand(
    new Command('merge')
      .description('Create PRs for feature')
      .argument('<name>', 'Feature name')
      .action(async (name) => {
        try {
          await repoOrch.mergeFeature(name);
          console.log(chalk.green(`✅ PRs created for feature '${name}'`));
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  )
  .addCommand(
    new Command('cleanup')
      .description('Cleanup feature branches')
      .argument('<name>', 'Feature name')
      .action(async (name) => {
        try {
          await repoOrch.cleanupFeature(name);
          console.log(chalk.green(`✅ Feature '${name}' cleaned up`));
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  );

program
  .command('status')
  .description('Show feature status')
  .argument('<name>', 'Feature name')
  .option('-d, --detailed', 'Show detailed status with commit counts')
  .action(async (name, options) => {
    try {
      if (options.detailed) {
        await repoOrch.showDetailedStatus(name);
      } else {
        await repoOrch.showStatus(name);
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
    }
  });

program
  .command('checkout')
  .description('Switch branches across all repos')
  .argument('<branch>', 'Branch name or feature name')
  .action(async (branch) => {
    try {
      await repoOrch.checkoutAll(branch);
      console.log(chalk.green(`✅ Switched all repos to ${branch}`));
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
    }
  });

program
  .command('diff')
  .description('Show changes across repos')
  .argument('<feature>', 'Feature name')
  .option('-s, --summary', 'Show summary only')
  .action(async (feature, options) => {
    try {
      await repoOrch.showDiff(feature, options);
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
    }
  });

program
  .command('doctor')
  .description('Check workspace health')
  .action(async () => {
    try {
      await repoOrch.doctor();
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
    }
  });

program
  .command('repo')
  .description('Repository management commands')
  .addCommand(
    new Command('create')
      .description('Create a new GitHub repository')
      .argument('<name>', 'Repository name')
      .option('--private', 'Create as private repository')
      .option('--description <desc>', 'Repository description')
      .option('--template <template>', 'Repository template')
      .action(async (name, options) => {
        try {
          const repo = await repoOrch.createGitHubRepository(name, {
            private: options.private || false,
            description: options.description,
            template: options.template
          });
          console.log(chalk.green(`✅ Repository created: ${repo.html_url}`));
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  )
  .addCommand(
    new Command('link')
      .description('Link local repository to GitHub')
      .argument('<name>', 'Local repository name')
      .argument('[remote-url]', 'GitHub repository URL (optional if authenticated)')
      .action(async (name, remoteUrl) => {
        try {
          await repoOrch.linkRepository(name, remoteUrl);
          console.log(chalk.green(`✅ Repository linked successfully`));
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  );

program
  .command('config')
  .description('Configure workspace settings')
  .addCommand(
    new Command('set-default-branch')
      .description('Set default branch for a repository')
      .argument('<repo>', 'Repository name')
      .argument('<branch>', 'Default branch name')
      .action(async (repo, branch) => {
        try {
          await repoOrch.setDefaultBranch(repo, branch);
          console.log(chalk.green(`✅ Set default branch for ${repo} to ${branch}`));
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  )
  .addCommand(
    new Command('show')
      .description('Show current configuration')
      .action(async () => {
        try {
          await repoOrch.showConfig();
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  );

program.parse();