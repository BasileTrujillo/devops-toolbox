'use strict';

const merge = require('merge');
const exec = require('executive');
const chalk = require('chalk');
const retry = require('retry');
const joi = require('joi');

const CmdBuilder = require('./cmd-builder');

class Executor {
  constructor(options) {
    this.options = merge({
      debug: false,
      verbose: false
    }, options || {});

    this.returnCode = 0;
  }

  exec(cmd, options) {
    const schema = joi.Object().keys({
      retries: joi.number().integer().min(0).default(Executor.DEFAULT_RETRIES),
      blocking: joi.boolean().default(true),
    }).unknown();

    let execOptions = joi.validate(options || {}, schema);

    if (execOptions.error) {
      throw new Error('Logger config validation error: ' + execOptions.error.message);
    }
    execOptions = execOptions.value;

    const operation = retry.operation({
      retries: execOptions.retries
    });

    let cmdList = cmd;

    // If cmd is not an array let's convert it
    if (cmd.constructor !== Array ) {
      cmdList = [cmd];
    }

    let execType = 'quiet';

    if (this.options.debug) {
      execType = 'parallel';
      this.log(chalk.styles.yellow.open + 'Executing: ');
      this.log(cmdList);
      this.log(chalk.styles.yellow.close);
    }

    return new Promise((resolve, reject) => {
      operation.attempt(() => {
        exec[execType](cmdList, {options: 'parallel'}).then(result => {
          resolve({
            success: true,
            result
          });
        }).catch(error => {
          const response = {
            success: false,
            error
          };

          if (execOptions.blocking) {
            reject(response);
          } else {
            resolve(response);
          }
        });
      });
    });
  }

  execCmd(cmdName, options) {
    if (typeof CmdBuilder[cmdName] === 'function') {
      return this.exec(CmdBuilder[cmdName](options), options);
    } else {
      throw new Error(`"${cmdName}" command not supported`);
    }
  }
}

// Default number of exec retry
Executor.DEFAULT_RETRIES = 0;

module.exports = Executor;
