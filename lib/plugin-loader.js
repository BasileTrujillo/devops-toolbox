'use strict';

const merge = require('merge');
const chalk = require('chalk');
const path = require('path');
const recursive = require('recursive-readdir');

class PluginLoader {
  constructor(program, options) {
    this.program = program;
    this.options = merge({
      verbose: false
    }, options || {});

    this.returnCode = 0;
    this.pluginRelBasePath = '../plugin';
    this.pluginAbsBasePath = path.join(__dirname, '../plugin');
    this.plugins = {};
  }

  loadAllPlugins() {
    return new Promise((resolve, reject) => recursive(this.pluginAbsBasePath, (error, files) => {
      if (error) {
        reject(error);
      } else {
        // Files is an array of filename
        for (let filesKey = 0; filesKey < files.length; filesKey++) {
          const splitedFile = files[filesKey].split(this.pluginAbsBasePath + '/')[1].split('/');
          const slugedPluginKey = splitedFile[(splitedFile.length - 1)].replace('.js', '');

          this.plugins[slugedPluginKey] = files[filesKey];
        }

        resolve(this);
      }
    }));
  }

  execPlugins(stackName) {
    if (this.options[stackName]) {

      const async = this.options[stackName].async || false;

      delete this.options[stackName].async;

      if (this.options[stackName].tasks &&
          this.options[stackName].tasks.constructor === Array &&
          this.options[stackName].tasks.length > 0) {

        let promiser = Promise.resolve();
        const execList = [];
        const taskList = this.options[stackName].tasks;

        for (let taskListKey = 0; taskListKey < taskList.length; taskListKey++) {
          if (taskList[taskListKey].plugin &&
              typeof taskList[taskListKey].plugin === 'string' &&
              taskList[taskListKey].plugin !== '') {

            taskList[taskListKey].verbose = this.getVerbosity(stackName, taskListKey);

            if (async) {
              execList.push(this.execPlugin(taskList[taskListKey]));
            } else {
              promiser = promiser.then(previousResponses =>
                this.execPlugin(taskList[taskListKey], previousResponses)
              );
            }
          } else {
            this.log(chalk.cyan('[Skipped] No plugin name specified in config for plugin #' +
                      taskListKey + ' in "' + stackName + '" stack.'));
          }
        }

        if (async) {
          promiser = Promise.all(execList);
        }

        promiser.then(response => {
          if (response.constructor === Array) {
            for (let responseKey = 0; responseKey < response.length; responseKey++) {
              if (response[responseKey].constructor === Array && response[responseKey][0]) {
                // Workaround for Async Process
                response[responseKey] = response[responseKey][0];
              }
              if (response[responseKey].success) {
                this.log(chalk.green(`Plugin "${response[responseKey].plugin}" successfully terminated.`));
              } else {
                this.log(chalk.magenta(
                  `Plugin "${response[responseKey].plugin}" terminated with non-blocking errors.`
                )).log('\tError Message: ' + chalk.magenta(response[responseKey].error));
              }
            }
          } else {
            if (response.success) {
              this.log(chalk.green('All Plugins successfully terminated.'));
            } else {
              this.log(chalk.magenta('Plugins terminated with non-blocking errors.'))
                .log(chalk.magenta(response.error));
            }
          }
        })
          .catch(response => {
            if (response.constructor.name === 'Object') {
              if (response.success) {
                this.log(chalk.magenta(`Plugin "${response.plugin}" terminated with non-blocking errors.`));
              } else {
                this.log(chalk.bold.red(`Plugin "${response.plugin}" terminated with errors.`))
                  .log(chalk.red(response.error));
                process.exitCode = 1;
              }
            } else {
              this.log(chalk.bold.red('Plugin throws a blocking error.'))
                .log(response);
              process.exitCode = 1;
            }
          });
      } else {
        this.log('No "tasks" found in stack "' + stackName + '".');
      }
    } else {
      throw new Error(`No stack [${stackName}] found in config.`);
    }
  }

  getVerbosity(stackName, taskListKey) {
    let verbose = false;

    if (typeof this.options[stackName].tasks[taskListKey].verbose === 'boolean') {
      verbose = this.options[stackName].tasks[taskListKey].verbose;
    } else if (typeof this.options[stackName].verbose === 'boolean') {
      verbose = this.options[stackName].verbose;
    } else if (typeof this.options.verbose === 'boolean') {
      verbose = this.options.verbose;
    }

    return verbose;
  }

  execPlugin(pluginOpts, previousResponses) {
    let Plugin;

    try {
      Plugin = require(this.plugins[pluginOpts.plugin] || 'dotbox-' + pluginOpts.plugin);
    } catch (error) {
      console.error(error);
      throw new Error(`"${pluginOpts.plugin}" plugin does not exist yet.`);
    }

    try {
      const plugin = new Plugin(merge(pluginOpts, {previousResponses}));

      return plugin.run();
    } catch (error) {
      this.log(chalk.bold.red(`${pluginOpts.plugin} Plugin throws the following error: `)).log(chalk.red(error));
      process.exitCode = 1;

      return Promise.reject(error);
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



module.exports = PluginLoader;
