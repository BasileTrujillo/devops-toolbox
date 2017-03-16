'use strict';

const merge = require('merge');
const chalk = require('chalk');
const fs = require('fs');
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
    this.plugins = {};
  }

  execPlugins(stackName, category, func) {
    if (this.options[stackName]) {
      let catList = [];
      const async = this.options[stackName].async || false;

      delete this.options[stackName].async;
      if (category) {
        catList.push(category);
      } else {
        catList = Object.keys(this.options[stackName]);
      }

      if (catList.length > 0) {
        // For each category
        let promiser = Promise.resolve();
        const execList = [];

        for (let catListKey = 0; catListKey < catList.length; catListKey++) {
          const pluginsBaseRelPath = path.join(this.pluginRelBasePath, catList[catListKey]);
          const pluginList = Object.keys(this.options[stackName][catList[catListKey]]);

          // For each plugin file inside a category
          for (let filesKey = 0; filesKey < pluginList.length; filesKey++) {
            const pluginBaseName = pluginList[filesKey];

            // If the plugin config entry is specified
            const pluginOpts = this.options[stackName][catList[catListKey]][pluginBaseName];

            if (pluginOpts) {
              pluginOpts.verbose = this.getVerbosity(pluginOpts);

              if (async) {
                execList.push(this.execPlugin(
                  pluginsBaseRelPath,
                  pluginBaseName,
                  func,
                  pluginOpts
                ));
              } else {
                promiser = promiser.then(previousResponses =>
                  this.execPlugin(
                    pluginsBaseRelPath,
                    pluginBaseName,
                    func,
                    pluginOpts,
                    previousResponses
                  )
                );
              }
            }
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
        this.log('No plugin specified in config.');
      }
    } else {
      throw new Error(`No stack [${stackName}] found in config.`);
    }
  }

  getVerbosity(object) {
    return object.verbose || this.options.verbose || false;
  }

  execPlugin(pluginPath, pluginName, func, options, previousResponses) {
    let Plugin;

    try {
      Plugin = require(path.join(pluginPath, pluginName));
    } catch (error) {
      //console.error(error);
      throw new Error(`"${pluginName}" plugin does not exist yet.`);
    }

    const plugin = new Plugin(merge(options, {previousResponses}));

    try {
      return plugin.run(func);
    } catch (error) {
      this.log(chalk.bold.red(`${pluginName} Plugin throws the following error: `)).log(chalk.red(error));
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
