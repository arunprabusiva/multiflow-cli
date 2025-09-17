#!/usr/bin/env node

const { Command } = require('commander');
const RepoOrch = require('./core/RepoOrch');
const chalk = require('chalk');

const program = new Command();
const repoOrch = new RepoOrch();

program
  .name('flow')
  .description('Coordinate Git operations across multiple repositories')
  .version('2.0.2');

program
  .command('about')
  .description('Show information about MultiFlow')
  .action(() => {
    console.log(chalk.cyan('🌊 MultiFlow - Multi-Repo Workflow CLI'));
    console.log(chalk.gray('Version: 2.0.2'));
    console.log(chalk.gray('Created by: Arunprabu Sivapprakasam'));
    console.log(chalk.gray('GitHub: https://github.com/arunprabusiva/multiflow-cli'));
    console.log(chalk.gray('LinkedIn: https://linkedin.com/in/arunprabusiva'));
    console.log(chalk.gray('License: MIT'));
    console.log('');
    console.log(chalk.yellow('✨ Streamline feature development across multiple repositories'));
  });

program
  .command('init')
  .description('Initialize workspace and scan for repositories')
  .action(async () => {
    try {
      await repoOrch.init();
      console.log(chalk.green('\n✅ Workspace initialized successfully'));
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
          console.log(chalk.green(`\n✅ Feature '${name}' created across all repos`));
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
          console.log(chalk.green(`\n✅ Changes committed for feature '${name}'`));
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
          console.log(chalk.green(`\n✅ Feature '${name}' published`));
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  )
  .addCommand(
    new Command('merge')
      .description('Check merge readiness for feature')
      .argument('<name>', 'Feature name')
      .action(async (name) => {
        try {
          await repoOrch.mergeFeature(name);
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
          console.log(chalk.green(`\n✅ Feature '${name}' cleaned up`));
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
      console.log(chalk.green(`\n✅ Switched all repos to ${branch}`));
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
  .command('pull')
  .description('Pull latest changes from all repos')
  .action(async () => {
    try {
      await repoOrch.pullAll();
      console.log(chalk.green('\n✅ Pull completed across all repositories'));
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
    }
  });

program
  .command('push')
  .description('Push changes to all repos')
  .action(async () => {
    try {
      await repoOrch.pushAll();
      console.log(chalk.green('\n✅ Push completed across all repositories'));
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
    }
  });

program
  .command('pr')
  .description('Create pull requests for feature')
  .argument('<feature>', 'Feature name')
  .option('-t, --title <title>', 'PR title')
  .option('-b, --body <body>', 'PR description', '')
  .action(async (feature, options) => {
    try {
      const title = options.title || `feat: ${feature}`;
      await repoOrch.createPRs(feature, title, options.body);
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
    }
  });

program
  .command('profile')
  .description('Profile management commands')
  .addCommand(
    new Command('create')
      .description('Create a new profile')
      .argument('<name>', 'Profile name')
      .option('-r, --repos <repos...>', 'Repository names to include')
      .action(async (name, options) => {
        try {
          await repoOrch.createProfile(name, options.repos || []);
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  )
  .addCommand(
    new Command('switch')
      .description('Switch to a profile')
      .argument('<name>', 'Profile name')
      .action(async (name) => {
        try {
          await repoOrch.switchProfile(name);
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  )
  .addCommand(
    new Command('list')
      .description('List all profiles')
      .action(async () => {
        try {
          await repoOrch.listProfiles();
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  )
  .addCommand(
    new Command('delete')
      .description('Delete a profile')
      .argument('<name>', 'Profile name')
      .action(async (name) => {
        try {
          await repoOrch.deleteProfile(name);
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  )
  .addCommand(
    new Command('show')
      .description('Show profile details')
      .argument('<name>', 'Profile name')
      .action(async (name) => {
        try {
          await repoOrch.showProfile(name);
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  );

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
    new Command('set-default-branch')
      .description('Set default branch for repository')
      .argument('<repo>', 'Repository name')
      .argument('<branch>', 'Branch name')
      .action(async (repo, branch) => {
        try {
          await repoOrch.setDefaultBranch(repo, branch);
          console.log(chalk.green(`✅ Set default branch for ${repo} to ${branch}`));
        } catch (error) {
          console.error(chalk.red('❌ Error:', error.message));
        }
      })
  );

program.parse();