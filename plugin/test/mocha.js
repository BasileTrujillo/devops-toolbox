'use strict';

const joi = require('joi');
const merge = require('merge');
const Plugin = require('../../lib/plugin');

class Mocha extends Plugin {
  /**
   * @param {Object} options Plugin Options
   */
  constructor(options) {
    super(options);

    this.defaultOptsSchemaKeys = {
      useNyc: joi.boolean().default(false),
      nycReporters: joi.array().default([]),
      nycCustomArgs: joi.array().default([]),
      colors: joi.boolean().default(true),
      recursive: joi.boolean().default(true),
      timeout: joi.number().integer().default(0),
      targets: joi.array().default([]),
      customArgs: joi.array().default(null)
    };

    this.optSchema = joi.object().keys(this.defaultOptsSchemaKeys).unknown();

    this.description = 'Mocha JavaScript test framework';
  }

  /**
   * Run the default plugin function
   * Execute "mocha" command
   *
   * @return {Promise} Return a Promise of the execution
   */
  run_default() {
    const pluginOptions = this.validateOptions();

    this.cmd = 'mocha';
    const args = this.fillDefaultArgs(pluginOptions);

    this.installCmd.push('npm i --save-dev ' + this.cmd);
    this.installCmd.push('npm i -g ' + this.cmd);

    return this.execExternalCmd(this.cmd, args, this.options);
  }

  /**
   * Fill default command's arguments
   *
   * @param {Object} pluginOptions Plugin's Options
   * @return {Array} List of arguments
   */
  fillDefaultArgs(pluginOptions) {
    let args = [];

    if (pluginOptions.useNyc) {
      if (pluginOptions.nycReporters.length > 0) {
        for (const key in pluginOptions.nycReporters) {
          args.push('--reporter=' + pluginOptions.nycReporters[key]);
        }
      }

      if (pluginOptions.nycCustomArgs.length > 0) {
        args = args.concat(pluginOptions.nycCustomArgs);
      }

      args.push(this.cmd);
      if (this.checkExistingExternalCmd()) {
        this.cmd = 'nyc';
      } else {
        throw Error(`"${this.cmd}" command not found.`);
      }
    }

    if (pluginOptions.colors) {
      args.push('--colors');
    }

    if (pluginOptions.recursive) {
      args.push('--recursive');
    }

    if (pluginOptions.timeout > 0) {
      args.push('--timeout');
      args.push(pluginOptions.timeout);
    }

    if (pluginOptions.customArgs !== null) {
      args = args.concat(pluginOptions.customArgs);
    }

    if (pluginOptions.targets.length > 0) {
      args = args.concat(pluginOptions.targets);
    }

    return args;
  }

  /**
   * Run the jenkins plugin function
   * Execute "jenkins-mocha" command
   *
   * @return {Promise} Return a Promise of the execution
   */
  run_jenkins() {
    this.optSchema = joi.object().keys(
      merge(this.defaultOptsSchemaKeys, {
        cobertura: joi.boolean().default(true),
        noCoverage: joi.boolean().default(false),
      })
    ).unknown();

    const pluginOptions = this.validateOptions();

    this.cmd = 'jenkins-mocha';

    const args = this.fillDefaultArgs(pluginOptions);

    this.installCmd.push('npm i --save-dev ' + this.cmd);
    this.installCmd.push('npm i -g ' + this.cmd);

    if (pluginOptions.noCoverage) {
      args.push('--no-coverage');
    } else if (pluginOptions.cobertura) {
      args.push('--cobertura');
    }

    return this.execExternalCmd(this.cmd, args, this.options);
  }
}

module.exports = Mocha;
