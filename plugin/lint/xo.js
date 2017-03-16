'use strict';

const joi = require('joi');
const Plugin = require('../../lib/plugin');

class xo extends Plugin {
  constructor(options) {
    super(options);

    this.optSchema = joi.object().keys({
      checkstyleExport: joi.boolean().default(false),
      checkstyleExportPath: joi.string().default('artifacts/eslint/eslint.xml'),
      targets: joi.array().default(['']),
      customArgs: joi.array().default(null)
    }).unknown();

    this.description = 'EsLint XO checkstyle';
  }

  run_default() {
    const pluginOptions = this.validateOptions();

    this.cmd = 'xo';
    this.installCmd.push('npm i --save-dev xo');
    this.installCmd.push('npm i -g xo');

    let args = [];

    if (pluginOptions.customArgs !== null) {
      args = args.concat(pluginOptions.customArgs);
    }

    if (pluginOptions.targets.length > 0) {
      args = args.concat(pluginOptions.targets);
    }

    return this.execExternalCmd(this.cmd, args, this.options);
  }
}

module.exports = xo;
