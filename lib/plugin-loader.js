'use strict';

const merge = require('merge');
const chalk = require('chalk');
const path = require('path');
const recursive = require('recursive-readdir');

class PluginLoader {
  /**
   * @param {Object} options PluginLoader Options
   */
  constructor(options) {
    this.options = merge({
      verbose: false
    }, options || {});

    this.pluginAbsBasePath = path.join(__dirname, '../plugin');
    this.plugins = {};
  }

  /**
   * Load all internal plugins
   * Put "plugin name" : "plugin path" inside this.plugin
   *
   * @return {Promise} Return the Promise that perform the recursive file search.
   */
  loadAllPlugins() {
    return new Promise((resolve, reject) => recursive(this.pluginAbsBasePath, (error, files) => {
      if (error) {
        reject(error);
      } else {
        // Files is an array of filename
        for (let filesKey = 0; filesKey < files.length; filesKey++) {
          const splitedFile = files[filesKey].split(this.pluginAbsBasePath + path.sep)[1].split(path.sep);
          const slugedPluginKey = splitedFile[(splitedFile.length - 1)].replace('.js', '');

          this.plugins[slugedPluginKey] = files[filesKey];
        }

        resolve(this);
      }
    }));
  }

  /**
   * Execute all plugins specified in the provided stack name
   * related to the config passed in the constructor.
   * This function also perform the async or sync process.
   *
   * @param {String} stackName The configuration Stack Name to execute.
   * @return {PluginLoader} Return this
   */
  execPlugins(stackName) {
    if (this.options[stackName]) {

      const async = this.options[stackName].async || false;

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

        promiser.then (response => this.handlePluginResponse(response))
                .catch(response => this.handlePluginResponse(response, true));
      } else {
        this.log('No "tasks" found in stack "' + stackName + '".');
      }
    } else {
      throw new Error(`No stack [${stackName}] found in config.`);
    }

    return this;
  }

  /**
   * Handle plugin responses
   *
   * @param {Object} response Plugin response object
   * @param {Boolean?} failure Pass true if plugin response come from catch promise
   * @return {void} void
   */
  handlePluginResponse(response, failure) {
    if (response.constructor === Array) {
      for (let responseKey = 0; responseKey < response.length; responseKey++) {
        if (response[responseKey].constructor === Array && response[responseKey][0]) {
          // Workaround for Async Process
          response[responseKey] = response[responseKey][0];
        }
        if (response[responseKey].success) {
          this.log(chalk.green(`Plugin "${response[responseKey].plugin}" successfully terminated.`));
        } else if (!failure) {
          this.log(chalk.magenta(`Plugin "${response[responseKey].plugin}" terminated with non-blocking errors.`))
              .log('\tError Message: ' + chalk.magenta(response[responseKey].error));
        } else {
          this.log(chalk.bold.red(`Plugin "${response[responseKey].plugin}" terminated with errors.`))
            .log(chalk.red(response[responseKey].error));
          process.exitCode = 1;
        }
      }
    } else if (response.constructor.name === 'Object') {
      this.handlePluginResponse([response], failure);
    } else {
      this.log(chalk.bold.red('Plugin throws a blocking error.'))
        .log(response);
      process.exitCode = 1;
    }
  }

  /**
   * Get a plugin's verbosity.
   * This function first look at verbose param inside plugin object in config
   * Then look at the stack's verbose param
   * Then look at the global's verbose param
   * Finally set verbosity to false
   *
   * @param {String} stackName The stack name
   * @param {Number} taskListKey The plugin index inside the stack
   * @return {boolean} Return whether verbose is enabled or not
   */
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

  /**
   * Execute a plugin related to pluginOpts passed as first argument
   * This will execute an internal plugin if exists or try to execute a third part plugin
   * Third part plugins must be "require()"-able with 'dotbox-' + pluginName
   *
   * @param {Object} pluginOpts Plugin options object. Must contain at least a "plugin" param containing the plugin name
   * @param {Array?} previousResponses Array of potential previous plugin responses to pass through.
   * @return {Promise} Return a Promise return by plugin running
   */
  execPlugin(pluginOpts, previousResponses) {
    let Plugin;

    // Try to require the plugin
    try {
      /* eslint-disable */
      Plugin = require(this.plugins[pluginOpts.plugin] || 'dotbox-' + pluginOpts.plugin);
      /* eslint-enable */
    } catch (error) {
      console.error(error);
      throw new Error(`"${pluginOpts.plugin}" plugin does not exist yet.`);
    }

    // Instantiate and run plugin
    try {
      const plugin = new Plugin(merge(pluginOpts, {previousResponses}));

      return plugin.run();
    } catch (error) {
      return Promise.reject({
        success: false,
        plugin: pluginOpts.plugin,
        error
      });
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
