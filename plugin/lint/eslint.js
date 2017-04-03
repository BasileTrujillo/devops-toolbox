'use strict';

const joi = require('joi');
const fs = require('fs-extra');
const Plugin = require('../../lib/plugin');

class Eslint extends Plugin {
  /**
   * @param {Object} options Plugin Options
   */
  constructor(options) {
    super(options);

    this.optSchema = joi.object().keys({
      eslintrcPath: joi.string().allow('').default(''),
      checkstyleExport: joi.boolean().default(false),
      checkstyleExportPath: joi.string().default('artifacts/eslint/eslint.xml'),
      targets: joi.array().default(['.']),
      customArgs: joi.array().default(null)
    }).unknown();

    this.description = 'EsLint checkstyle';
  }

  /**
   * Run the default plugin function
   *
   * @return {Promise} Return a Promise of the execution
   */
  run_default() {
    const pluginOptions = this.validateOptions();

    this.cmd = 'eslint';
    this.installCmd.push('npm i --save-dev eslint');
    this.installCmd.push('npm i -g eslint');

    let args = [];

    if (pluginOptions.eslintrcPath !== '') {
      args.push('-c');
      args.push(pluginOptions.eslintrcPath);
    }

    if (pluginOptions.checkstyleExport) {
      args.push('-f');
      args.push('checkstyle');
    }

    if (pluginOptions.customArgs !== null) {
      args = args.concat(pluginOptions.customArgs);
    }

    if (pluginOptions.targets.length > 0) {
      args = args.concat(pluginOptions.targets);
    }

    if (pluginOptions.checkstyleExport) {
      args.push('>');
      args.push(pluginOptions.checkstyleExportPath);
      this.options.redirectedOutput = true;
      fs.ensureFileSync(pluginOptions.checkstyleExportPath);
    }

    return this.execExternalCmd(this.cmd, args, this.options);
  }
}

module.exports = Eslint;
