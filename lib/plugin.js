'use strict';

const childProcess = require('child_process');
const chalk = require('chalk');
const retry = require('retry');
const joi = require('joi');
const commandExistsSync = require('command-exists').sync;

class Plugin {
  constructor(options) {
    this.optSchema = joi.object();

    this.options = this.validateObject(options || {}, joi.object().keys({
      redirectedOutput: joi.boolean().default(false),
      previousResponses: joi.array().default([])
    }).unknown());

    this.cmd = '';
    this.installCmd = [];
    this.description = 'Plugin';
  }

  /**
   * Run a plugin function starting with 'run_' + functionName
   *
   * @return {*} Return the result of the plugin's function call
   */
  run() {
    const runner = this.options.function || 'default';
    const internalFunc = 'run_' + runner;

    if (!this[internalFunc] || typeof this[internalFunc] !== 'function') {
      throw new Error(`No "${runner}" function found in ${this.constructor.name} Plugin`);
    } else {
      this.log(chalk.green('Running: ' + this.description + ` ("${runner}" function)`));

      return this[internalFunc]();
    }
  }

  /**
   * Validate plugin's options with plugin's options JOI schema
   *
   * @return {Object} Return validated options
   */
  validateOptions() {
    return this.validateObject(this.options || {}, this.optSchema);
  }

  /**
   * Validate an object with a schema and return a validated object
   *
   * @param {Object} object Object to validate
   * @param {Joi.Object} schema Joi Schema
   * @return {Object} Return validated options
   */
  validateObject(object, schema) {
    const validatedObject = joi.validate(object, schema);

    if (validatedObject.error) {
      throw new Error(this.constructor.name + ' config validation error: ' + validatedObject.error.message);
    }

    return validatedObject.value;
  }

  /**
   * Execute an external shell command
   * It check if function exists before executing it. If function does not exists, install commands are prompted
   *
   * @param {String}  cmd                       The command to execute without any argument
   * @param {Array}   args                      Array of command's arguments (one argument per row)
   * @param {Object}  options                   Execution options
   * @param {Number}  options.retries           Number of execution attempt before fail
   * @param {Boolean} options.blocking          Define if the execution is blocking or not (blocking mean that the global process will fail)
   * @param {Boolean} options.redirectedOutput  Define the execution output is redirected using > or not (it will perform childProcess.exec() if true, otherwise childProcess.spawn())
   * @return {Promise} Return a Promise with a result object containing { success: true|false, plugin: pluginName, error: potentialError }
   */
  execExternalCmd(cmd, args, options) {
    const schema = joi.object().keys({
      retries: joi.number().integer().min(0).default(Plugin.DEFAULT_RETRIES),
      blocking: joi.boolean().default(true),
      redirectedOutput: joi.boolean().default(false)
    }).unknown();

    const execOptions = this.validateObject(options || {}, schema);

    if (this.checkExistingExternalCmd()) {

      const operation = retry.operation({
        retries: execOptions.retries
      });

      let stdio = [0, 'pipe', 'pipe'];

      if (this.options.verbose) {
        stdio = [process.stdin, process.stdout, process.stderr];
      }

      return new Promise((resolve, reject) => {
        operation.attempt(() => {
          const fullCmd = cmd + ' ' + args.join(' ');

          if (execOptions.redirectedOutput) {
            this.log('Executing with redirected output :').log(fullCmd);
            childProcess.exec(fullCmd, error => {
              if (error) {
                const response = this.options.previousResponses.concat([{
                  success: false,
                  plugin: this.constructor.name,
                  error
                }]);

                if (execOptions.blocking) {
                  reject(response);
                } else {
                  resolve(response);
                }
              } else {
                resolve(this.options.previousResponses.concat([{
                  success: true,
                  plugin: this.constructor.name
                }]));
              }
            });
          } else {
            this.log('Executing without redirected output :').log(fullCmd);
            this.response = {
              success: true,
              plugin: this.constructor.name
            };

            childProcess.spawn(cmd, args, {stdio, shell: true})
              .on('error', error => {
                this.response.success = false;
                this.response.error = error;
              }).on('close', code => {
                if (code > 0) {
                  this.response.success = false;
                  this.response.error = `Process exited with code ${code}`;

                  if (execOptions.blocking) {
                    reject(this.getResponse());
                  } else {
                    resolve(this.getResponse());
                  }
                } else {
                  resolve(this.getResponse());
                }
              });
          }
        });
      });
    } else {
      try {
        this.proposeInstallCmd(execOptions);

        const response = this.options.previousResponses.concat([{
          success: false,
          plugin: this.constructor.name,
          error: this.cmd + ' command not found.'
        }]);

        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }

  /**
   * Concat potential previous responses with current response
   *
   * @return {Array} Array of plugins responses
   */
  getResponse() {
    return this.options.previousResponses.concat(this.response);
  }

  /**
   * Check if the plugin's command exists, or is callable
   *
   * @return {Boolean} Return true if command exists or is callable, otherwise return false
   */
  checkExistingExternalCmd() {
    if (typeof this.cmd !== 'string' || this.cmd === '') {
      throw new Error(`Command not defined in plugin "${this.constructor.name}"`);
    } else {
      return commandExistsSync(this.cmd);
    }
  }

  /**
   * Prompt install commands if defined in plugin
   *
   * @param {Object} execOptions Current execution options
   * @return {Plugin} Return this
   */
  proposeInstallCmd(execOptions) {
    if (this.installCmd.length === 0) {
      console.log(chalk.magenta(this.cmd + ' command not found.'));
    } else {
      const errMsg = this.cmd + ' command not found, you can install it using one of the following commands:\n\t$ ' +
                     this.installCmd.join('\n\t$ ');

      if (execOptions.blocking){
        throw new Error(errMsg);
      } else {
        console.log(chalk.magenta(errMsg));
      }
    }

    return this;
  }

  /**
   * Console log only if verbose option is defined
   *
   * @param {String} msg Message to display
   * @return {Plugin} Return this
   */
  log(msg) {
    if (this.options.verbose) {
      console.log(msg);
    }

    return this;
  }
}

// Default number of exec retry
Plugin.DEFAULT_RETRIES = 0;

module.exports = Plugin;
