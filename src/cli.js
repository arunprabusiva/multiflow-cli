#!/usr/bin/env node

const { Command } = require('commander');
const RepoOrch = require('./core/RepoOrch');
const chalk = require('chalk');

const program = new Command();
const repoOrch = new RepoOrch();

program
  .name('flow')
  .description('Multi-repo workflow orchestration CLI')
  .version('1.0.0');

program
  .command('about')
  .description('Show information about MultiFlow')
  .action(() => {
    console.log(chalk.cyan('🌊 MultiFlow - Multi-Repo Workflow CLI'));
    console.log(chalk.gray('Version: 1.0.0'));
    console.log(chalk.gray('Created by: Arunprabu Sivapprakasam'));
    console.log(chalk.gray('GitHub: https://github.com/arunprabusiva/multiflow-cli'));
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
      console.log(chalk.green('✅ Workspace initialized successfully'));
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
  .action(async (name) => {
    try {
      await repoOrch.showStatus(name);
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
    }
  });

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