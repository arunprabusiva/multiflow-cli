#!/usr/bin/env node

const { Command } = require('commander');
const RepoOrch = require('./core/RepoOrch');
const chalk = require('chalk');

const program = new Command();
const repoOrch = new RepoOrch();

program
  .name('flow')
  .description('Coordinate Git operations across multiple repositories')
  .version('1.2.0');

program
  .command('about')
  .description('Show information about MultiFlow')
  .action(() => {
    console.log(chalk.cyan('🌊 MultiFlow - Multi-Repo Workflow CLI'));
    console.log(chalk.gray('Version: 1.2.0'));
    console.log(chalk.gray('Created by: Arunprabu Sivapprakasam'));
    console.log(chalk.gray('GitHub: https://github.com/arunprabusiva/multiflow-cli'));
    console.log(chalk.gray('License: MIT'));
    console.log('');
    console.log(chalk.yellow('✨ Streamline feature development across multiple repositories'));
  });



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
      .option('--repos <repos>', 'Comma-separated list of specific repos')
      .option('--dry-run', 'Show what would be done without executing')
      .option('--stash', 'Stash uncommitted changes before creating branch')
      .action(async (name, options) => {
        try {
          await repoOrch.createFeature(name, options);
          if (!options.dryRun) {
            console.log(chalk.green(`✅ Feature '${name}' created`));
          }
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
      .option('--repos <repos>', 'Comma-separated list of specific repos')
      .option('--dry-run', 'Show what would be committed without executing')
      .action(async (name, options) => {
        try {
          await repoOrch.commitFeature(name, options.message, options);
          if (!options.dryRun) {
            console.log(chalk.green(`✅ Changes committed for feature '${name}'`));
          }
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
      .option('--repos <repos>', 'Comma-separated list of specific repos')
      .option('--dry-run', 'Show what would be cleaned up without executing')
      .action(async (name, options) => {
        try {
          await repoOrch.cleanupFeature(name, options);
          if (!options.dryRun) {
            console.log(chalk.green(`✅ Feature '${name}' cleaned up`));
          }
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
  .command('config')
  .description('Configure workspace settings')
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
  )
  .addCommand(
    new Command('ignore')
      .description('Add repository to ignore list')
      .argument('<repo>', 'Repository name to ignore')
      .action(async (repo) => {
        try {
          await repoOrch.ignoreRepository(repo);
          console.log(chalk.green(`✅ Added ${repo} to ignore list`));
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  )
  .addCommand(
    new Command('unignore')
      .description('Remove repository from ignore list')
      .argument('<repo>', 'Repository name to unignore')
      .action(async (repo) => {
        try {
          await repoOrch.unignoreRepository(repo);
          console.log(chalk.green(`✅ Removed ${repo} from ignore list`));
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  );

// GitHub integration commands (advanced)
program
  .command('auth')
  .description('GitHub authentication (optional)')
  .addCommand(
    new Command('token')
      .description('Login with GitHub token')
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
    new Command('status')
      .description('Show authentication status')
      .action(async () => {
        try {
          const user = await repoOrch.githubAuth.getAuthenticatedUser();
          console.log(chalk.green(`✅ Authenticated as ${user.name || user.login}`));
        } catch (error) {
          console.log(chalk.yellow('⚠️  Not authenticated (GitHub features disabled)'));
        }
      })
  );

program.parse();