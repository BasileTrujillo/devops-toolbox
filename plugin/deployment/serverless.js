'use strict';

const joi = require('joi');
const Plugin = require('../../lib/plugin');
const SymlinkResolver = require('../misc/symlink-resolver');

class serverless extends Plugin {
  constructor(options) {
    super(options);

    this.defaultOptsSchemaKeys = {
      slsFunction: joi.string().required(),
      quiet: joi.boolean().default(false),
      region: joi.string().valid([
        'ap-northeast-1',
        'ap-northeast-2',
        'ap-south-1',
        'ap-southeast-1',
        'ap-southeast-2',
        'cn-north-1',
        'eu-central-1',
        'eu-west-1',
        'eu-west-2',
        'sa-east-1',
        'us-east-1',
        'us-east-2',
        'us-west-1',
        'us-west-2',
      ]).default(null),
      stage: joi.string().default(null),
      removeDevDependencies: joi.boolean().default(true),
      restoreDevDependencies: joi.boolean().default(false),
      resolveSymlinks: joi.array().items(joi.string()).default([]),
      restoreSymlinks: joi.boolean().default(true),
      customArgs: joi.array().default(null)
    };

    this.optSchema = joi.object().keys(this.defaultOptsSchemaKeys).unknown();

    this.cmd = 'serverless';
    this.installCmd.push('npm i -g ' + this.cmd);
    this.description = 'The Serverless Framework';
  }

  /**
   * Run the default plugin function
   *
   * @return {Promise} Return a Promise of the execution
   */
  run_default() {
    const pluginOptions = this.validateOptions();
    const args = this.fillDefautlArgs(pluginOptions);

    return new Promise((resolve, reject) => {
      let execPromise = Promise.resolve();

      if (pluginOptions.removeDevDependencies) {
        execPromise = this.execExternalCmd('npm', ['prune', '--production'])
          .then(() => this.execExternalCmd('npm', ['install', '--production']));
      }

      if (pluginOptions.resolveSymlinks.length > 0) {
        const symlinkResolver = new SymlinkResolver({
          links: pluginOptions.resolveSymlinks,
          verbose: pluginOptions.verbose,
        });

        execPromise = execPromise.then(() => symlinkResolver.run());
      }

      execPromise = execPromise.then(() => this.execExternalCmd(this.cmd, args, this.options));

      if (pluginOptions.resolveSymlinks.length > 0 && pluginOptions.restoreSymlinks) {
        const symlinkResolver = new SymlinkResolver({
          function: 'restore',
          links: pluginOptions.resolveSymlinks,
          verbose: pluginOptions.verbose,
        });

        execPromise = execPromise.then(() => symlinkResolver.run());
      }

      if (pluginOptions.restoreDevDependencies) {
        execPromise = execPromise.then(() => this.execExternalCmd('npm', ['install']));
      }

      return execPromise.then(response => resolve(response)).catch(response => reject(response));
    });
  }

  /**
   * Fill default command's arguments
   *
   * @param {Object} pluginOptions Plugin's Options
   * @return {Array} List of arguments
   */
  fillDefautlArgs(pluginOptions) {
    let args = [];

    if (pluginOptions.slsFunction) {
      args = args.concat(pluginOptions.slsFunction.split(' '));
    }

    if (pluginOptions.quiet === false) {
      args.push('--verbose');
    }

    if (pluginOptions.region !== null) {
      args.push('--region');
      args.push(pluginOptions.region);
    }

    if (pluginOptions.stage !== null) {
      args.push('--stage');
      args.push(pluginOptions.stage);
    }

    if (pluginOptions.customArgs !== null) {
      args = args.concat(pluginOptions.customArgs);
    }

    return args;
  }
}

module.exports = serverless;
