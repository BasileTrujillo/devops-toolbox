'use strict';

const joi = require('joi');
const Plugin = require('../../lib/plugin');

class CustomCmd extends Plugin {
  /**
   * @param {Object} options Plugin Options
   */
  constructor(options) {
    super(options);

    this.optSchema = joi.object().keys({
      cmd: joi.string().required(),
      customArgs: joi.array().default(null)
    }).unknown();

    this.description = 'Custom command';
  }

  /**
   * Run the default plugin function
   *
   * @return {Promise} Return a Promise of the execution
   */
  run_default() {
    const pluginOptions = this.validateOptions();

    this.cmd = pluginOptions.cmd;
    this.installCmd.push('No installation command provided.');

    let args = [];

    if (pluginOptions.customArgs !== null) {
      args = args.concat(pluginOptions.customArgs);
    }

    return this.execExternalCmd(this.cmd, args, this.options);
  }
}

module.exports = CustomCmd;
