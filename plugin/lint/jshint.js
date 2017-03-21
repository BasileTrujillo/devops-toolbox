'use strict';

const joi = require('joi');
const fs = require('fs-extra');
const Plugin = require('../../lib/plugin');

class jshint extends Plugin {
  constructor(options) {
    super(options);

    this.optSchema = joi.object().keys({
      checkstyleExport: joi.boolean().default(false),
      checkstyleExportPath: joi.string().default('artifacts/jshint/jshint.xml'),
      targets: joi.array().default(['.']),
      customArgs: joi.array().default(null)
    }).unknown();

    this.description = 'JSHint checkstyle';
  }

  /**
   * Run the default plugin function
   *
   * @return {Promise} Return a Promise of the execution
   */
  run_default() {
    const pluginOptions = this.validateOptions();

    this.cmd = 'jshint';
    this.installCmd.push('npm i --save-dev jshint');
    this.installCmd.push('npm i -g jshint');

    let args = [];

    if (pluginOptions.checkstyleExport) {
      args.push('--reporter=checkstyle');
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
    }

    fs.ensureFileSync(pluginOptions.checkstyleExportPath);

    return this.execExternalCmd(this.cmd, args, this.options);
  }
}

module.exports = jshint;
