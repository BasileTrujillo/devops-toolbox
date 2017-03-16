'use strict';

const joi = require('joi');
const fs = require('fs-extra');
const chalk = require('chalk');
const Plugin = require('../../lib/plugin');

class plato extends Plugin {
  constructor(options) {
    super(options);

    this.optSchema = joi.object().keys({
      outputDir: joi.string().default('artifacts/plato'),
      eslintrcPath: joi.string().allow('').default(''),
      jshintrcPath: joi.string().allow('').default(''),
      title: joi.string().allow('').default(''),
      autoTitle: joi.boolean().default(true),
      recurse: joi.boolean().default(true),
      targets: joi.array().default(['.']),
      customArgs: joi.array().default(null)
    }).unknown();

    this.description = 'Visualize JavaScript source complexity with plato.';
  }

  run_default() {
    const pluginOptions = this.validateOptions();

    this.cmd = 'plato';
    this.installCmd.push('npm i --save-dev plato');
    this.installCmd.push('npm i -g plato');

    let args = [
      '-d',
      pluginOptions.outputDir,
    ];

    if (pluginOptions.recurse) {
      args.push('-r');
    }

    if (pluginOptions.title !== '') {
      args.push('-t');
      args.push(pluginOptions.title);
    } else if (pluginOptions.autoTitle) {
      try {
        const packageObj = fs.readJsonSync(plato.PACKAGEJSON_PATH);

        if (packageObj.name && packageObj.name !== '') {
          args.push('-t');
          args.push(packageObj.name);
        }
      } catch (error) {
        console.warn(chalk.magenta(error));
      }
    }

    if (pluginOptions.eslintrcPath !== '') {
      args.push('-e');
      args.push(pluginOptions.eslintrcPath);
    }

    if (pluginOptions.jshintrcPath !== '') {
      args.push('-l');
      args.push(pluginOptions.jshintrcPath);
    }

    if (pluginOptions.customArgs !== null) {
      args = args.concat(pluginOptions.customArgs);
    }

    if (pluginOptions.targets.length > 0) {
      args = args.concat(pluginOptions.targets);
    }

    return this.execExternalCmd(this.cmd, args, this.options);
  }
}

plato.PACKAGEJSON_PATH = './package.json';

module.exports = plato;
