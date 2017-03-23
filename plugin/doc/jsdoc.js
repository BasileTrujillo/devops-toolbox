'use strict';

const joi = require('joi');
const Plugin = require('../../lib/plugin');

class Jsdoc extends Plugin {
  constructor(options) {
    super(options);

    this.optSchema = joi.object().keys({
      outputDir: joi.string().default('artifacts/jsdoc'),
      configFilePath: joi.string().allow('').default(''),
      templatePath: joi.string().allow('').default(''),
      packagePath: joi.string().allow('').default(''),
      readmePath: joi.string().allow('').default(''),
      recurse: joi.boolean().default(true),
      targets: joi.array().default(['.']),
      customArgs: joi.array().default(null)
    }).unknown();

    this.description = 'JsDoc Generation';
  }

  /**
   * Run the default plugin function
   *
   * @return {Promise} Return a Promise of the execution
   */
  run_default() {
    const pluginOptions = this.validateOptions();

    this.cmd = 'jsdoc';
    this.installCmd.push('npm i --save-dev jsdoc');
    this.installCmd.push('npm i -g jsdoc');

    let args = [];

    if (pluginOptions.outputDir !== '') {
      args.push('-d');
      args.push(pluginOptions.outputDir);
    }

    if (pluginOptions.recurse) {
      args.push('-r');
    }

    if (pluginOptions.configFilePath !== '') {
      args.push('-c');
      args.push(pluginOptions.configFilePath);
    }

    if (pluginOptions.templatePath !== '') {
      args.push('-t');
      args.push(pluginOptions.templatePath);
    }

    if (pluginOptions.packagePath !== '') {
      args.push('-P');
      args.push(pluginOptions.packagePath);
    }

    if (pluginOptions.readmePath !== '') {
      args.push('-R');
      args.push(pluginOptions.readmePath);
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

module.exports = Jsdoc;
