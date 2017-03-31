'use strict';

const Plugin = require('../../lib/plugin');
const joi = require('joi');

class GitFileDownloader extends Plugin {
  /**
   * @param {Object} options Plugin Options
   */
  constructor(options) {
    super(options);

    this.optSchema = joi.object().keys({
      provider: joi.string().allow([
        'github',
        'gitlab'
      ]).required(),
      repository: joi.string().required(),
      file: joi.string().required(),
      branch: joi.string().default(false),
      output: joi.string().default(false),
      keep_original_path: joi.boolean().default(false),
      private_token: joi.string().default(false),  // Gitlab
      oauth2_token: joi.string().default(false),   // Github
      basic_username: joi.string().default(false), // Github
      basic_password: joi.string().default(false)  // Github
    }).unknown();

    this.cmd = 'git-file-downloader';
    this.description = 'Git File Downloader';
    this.installCmd.push('npm i --save-dev git-file-downloader');
    this.installCmd.push('npm i -g git-file-downloader');
  }

  /**
   * Run the default plugin function
   *
   * @return {Promise} Return a Promise of the execution
   */
  run_default() {
    const pluginOptions = this.validateOptions();

    const args = [
      '-p',
      pluginOptions.provider
    ];

    if (pluginOptions.branch) {
      args.push('-b');
      args.push(pluginOptions.branch);
    }

    if (pluginOptions.output) {
      args.push('-o');
      args.push(pluginOptions.output);
    }

    if (pluginOptions.private_token) {
      args.push('--gitlab-private-token');
      args.push(pluginOptions.private_token);
    }

    if (pluginOptions.oauth2_token) {
      args.push('--github-oauth-token');
      args.push(pluginOptions.oauth2_token);
    }

    if (pluginOptions.basic_username && pluginOptions.basic_password) {
      args.push('--github-basic-username');
      args.push(pluginOptions.basic_username);
      args.push('--github-basic-password');
      args.push(pluginOptions.basic_password);
    }

    if (pluginOptions.keep_original_path) {
      args.push('-k');
    }

    args.push(pluginOptions.repository);
    args.push(pluginOptions.file);

    return this.execExternalCmd(this.cmd, args, this.options);
  }
}

module.exports = GitFileDownloader;
