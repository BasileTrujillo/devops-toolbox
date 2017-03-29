'use strict';

const joi = require('joi');
const Plugin = require('../../lib/plugin');
const SymlinkResolver = require('../misc/symlink-resolver');

class Dpl extends Plugin {
  /**
   * @param {Object} options Plugin Options
   */
  constructor(options) {
    super(options);

    this.defaultOptsSchemaKeys = {
      provider: joi.string().required(),
      skipCleanup: joi.boolean().default(false),
      removeNpmDevDependencies: joi.boolean().default(true),
      restoreNpmDevDependencies: joi.boolean().default(false),
      resolveSymlinks: joi.array().items(joi.string()).default([]),
      restoreSymlinks: joi.boolean().default(true),
      customArgs: joi.array().default(null)
    };

    this.optSchema = joi.object().keys(this.defaultOptsSchemaKeys).unknown();

    this.cmd = 'dpl';
    this.installCmd.push('gem install ' + this.cmd);
    this.description = 'Dpl (dee-pee-ell)';
  }

  /**
   * Run the default plugin function
   *
   * @return {Promise} Return a Promise of the execution
   */
  run_default() {
    const pluginOptions = this.validateOptions();
    const args = this.fillDefaultArgs(pluginOptions);

    return new Promise((resolve, reject) => {
      let execPromise = Promise.resolve();

      if (pluginOptions.removeNpmDevDependencies) {
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

      if (pluginOptions.restoreNpmDevDependencies) {
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
  fillDefaultArgs(pluginOptions) {
    let args = [];

    if (pluginOptions.provider) {
      args.push('--provider=' + pluginOptions.provider);
    }

    if (pluginOptions.skipCleanup) {
      args.push('--skip_cleanup');
    }

    if (pluginOptions.customArgs !== null) {
      args = args.concat(pluginOptions.customArgs);
    }

    return args;
  }
}

module.exports = Dpl;
