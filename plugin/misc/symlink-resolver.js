'use strict';

const joi = require('joi');
const chalk = require('chalk');
const fs = require('fs-extra');
const Plugin = require('../../lib/plugin');

class SymlinkResolver extends Plugin {
  /**
   * @param {Object} options Plugin Options
   */
  constructor(options) {
    super(options);

    this.optSchema = joi.object().keys({
      links: joi.array().items(joi.string()).default([])
    }).unknown();

    this.description = 'Symlink Resolver';
    this.installCmd.push('No installation command provided.');
  }

  /**
   * Run the default plugin function
   * Perform a symlink resolution (copy the original file at the link's place)
   * and backup symlink for potential restoration
   *
   * @return {Promise} Return a Promise of the execution
   */
  run_default() {
    const pluginOptions = this.validateOptions();

    if (pluginOptions.links.length > 0) {
      const resolveList = [];

      for (let linksKey = 0; linksKey < pluginOptions.links.length; linksKey++) {
        resolveList.push(this.resolveSymlink(pluginOptions.links[linksKey]));
      }

      return Promise.all(resolveList).then(responses => this.options.previousResponses.concat(responses));
    } else {
      this.log(chalk.magenta('No link to resolve provided'));

      return Promise.resolve(this.options.previousResponses.concat({
        success: true,
        plugin: this.constructor.name
      }));
    }
  }

  /**
   * This function is just an alias to run the default plugin function
   *
   * @return {Promise} Return a Promise of the execution
   */
  run_resolve() {
    return this.run_default();
  }

  /**
   * Run the restore plugin function
   * Restore symlinks if backup files exists (backup files are created by default/resolve function.
   *
   * @return {Promise} Return a Promise of the execution
   */
  run_restore() {
    const pluginOptions = this.validateOptions();

    if (pluginOptions.links.length > 0) {
      const restoreList = [];

      for (let linksKey = 0; linksKey < pluginOptions.links.length; linksKey++) {
        restoreList.push(this.restoreSymlink(pluginOptions.links[linksKey]));
      }

      return Promise.all(restoreList);
    } else {
      this.log(chalk.magenta('No link to restore provided'));

      return Promise.resolve(this.options.previousResponses.concat({
        success: true,
        plugin: this.constructor.name
      }));
    }
  }

  /**
   * Perform a symlink resolution (copy the original file at the link's place)
   * and backup symlink for potential restoration
   *
   * @param {String} link Path to symlink
   * @return {Promise} Return a Promise of the execution
   */
  resolveSymlink(link) {
    return new Promise((resolve, reject) => {
      const response = {
        success: true,
        plugin: this.constructor.name + ' (Resolving ' + link + ')'
      };

      if (fs.existsSync(link)) {
        if (!fs.existsSync(link + SymlinkResolver.BACKUP_SUFFIX)) {
          try {
            fs.renameSync(link, link + SymlinkResolver.BACKUP_SUFFIX);
            fs.copySync(link + SymlinkResolver.BACKUP_SUFFIX, link, { dereference: true });

            resolve(response);
          } catch (error) {
            response.success = false;
            response.error = new Error('An error occurred when resolving symlink');
            response.error_details = error;
            reject(response);
          }
        } else {
          this.log(chalk.magenta('Symlink Backup file exists, skipping resolution.'));
          resolve(response);
        }
      } else {
        response.success = false;
        response.error = new Error(link + ' file not found.');
        reject(response);
      }
    });
  }

  /**
   * Restore symlinks if backup files exists (backup files are created by default/resolve function.
   *
   * @param {String} link Path to symlink
   * @return {Promise} Return a Promise of the execution
   */
  restoreSymlink(link) {
    return new Promise((resolve, reject) => {
      const response = {
        success: true,
        plugin: this.constructor.name + ' (Restoring ' + link + ')'
      };

      if (fs.existsSync(link + SymlinkResolver.BACKUP_SUFFIX)) {
        try {
          if (fs.existsSync(link)) {
            fs.unlinkSync(link);
          }

          fs.renameSync(link + SymlinkResolver.BACKUP_SUFFIX, link);

          resolve(response);
        } catch (error) {
          response.success = false;
          response.error = new Error('An error occurred when restoring symlink');
          response.error_details = error;
          reject(response);
        }
      } else {
        response.success = false;
        response.error = new Error(link + SymlinkResolver.BACKUP_SUFFIX + ' file not found.');
        reject(response);
      }
    });
  }
}

SymlinkResolver.BACKUP_SUFFIX = '.dotbox.bak';

module.exports = SymlinkResolver;
