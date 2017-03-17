#!/usr/bin/env node --harmony

'use strict';

const program = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const PluginLoader = require('./lib/plugin-loader');
const appVersion = require('./package.json').version;

let args = {};

program.version(appVersion)
  .description('DevOps Toolbox is a tool to help developers to run CI and CD commands.\n' +
    '  <stackName>\t The stack name provided in config file.\n' +
    '  <category>\t Plugin category (leave it empty to run all defined categories): lint, utest, doc, misc...')
  .arguments('<stackName> [category]')
  .action((stackName, category) => {
    args = { stackName, category };
  })
  .option(
    '-c, --config <config-file>',
    'Set DOTbox config file. Defaults to "./.dotbox.json"',
    './.dotbox.json'
  )
  .parse(process.argv);

if (!args.stackName) {
  console.error(chalk.red('No <stackName> provided.'));
  program.help();
} else {
  fs.readJson(program.config, (err, config) => {
    if (err) {
      console.error(err);
    } else {
      const loader = new PluginLoader(program, config);

      loader.execPlugins(args.stackName, args.category);
    }
  });
}
