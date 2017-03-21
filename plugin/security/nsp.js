'use strict';

const joi = require('joi');
const Plugin = require('../../lib/plugin');

class nsp extends Plugin {
  constructor(options) {
    super(options);

    this.optSchema = joi.object().keys({
      output: joi.string().allow([
        '',
        'default',
        'summary',
        'json',
        'codeclimate',
        'none'
      ]).default(''),
      customArgs: joi.array().default(null)
    }).unknown();

    this.description = 'Dependencies Security Check using NSP';
  }

  /**
   * Run the default plugin function
   *
   * @return {Promise} Return a Promise of the execution
   */
  run_default() {
    const pluginOptions = this.validateOptions();

    this.cmd = 'nsp';
    this.installCmd.push('npm i --save-dev nsp');
    this.installCmd.push('npm i -g nsp');

    let args = [
      'check'
    ];

    if (pluginOptions.output !== '') {
      args.push('--output');
      args.push(pluginOptions.output);
    }

    if (pluginOptions.customArgs !== null) {
      args = args.concat(pluginOptions.customArgs);
    }

    return this.execExternalCmd(this.cmd, args, this.options);
  }
}

module.exports = nsp;
