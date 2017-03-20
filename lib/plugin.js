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

  validateOptions() {
    return this.validateObject(this.options || {}, this.optSchema);
  }

  validateObject(options, schema) {
    const validatedObject = joi.validate(options, schema);

    if (validatedObject.error) {
      throw new Error(this.constructor.name + ' config validation error: ' + validatedObject.error.message);
    }

    return validatedObject.value;
  }

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
        stdio = [process.stdin, process.stdout, 'pipe'];
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

            childProcess.spawn(cmd, args, {stdio})
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

  getResponse() {
    return this.options.previousResponses.concat(this.response);
  }

  checkExistingExternalCmd() {
    if (typeof this.cmd !== 'string' || this.cmd === '') {
      throw new Error(`Command not defined in plugin "${this.constructor.name}"`);
    } else {
      return commandExistsSync(this.cmd);
    }
  }

  proposeInstallCmd(execOptions) {
    if (this.installCmd.length === 0) {
      throw new Error(`Install command not defined for "${this.cmd}"`);
    } else {
      const errMsg = this.cmd + ' command not found, you can install it using one of the following commands:\n\t$ ' +
                     this.installCmd.join('\n\t$ ');

      if (execOptions.blocking){
        throw new Error(errMsg);
      } else {
        console.log(chalk.magenta(errMsg));
      }
    }
  }

  /**
   * Console log only if verbose option is defined
   *
   * @param {String} msg Message to display
   * @return {PluginLoader} This
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
