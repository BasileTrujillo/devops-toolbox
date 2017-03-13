'use strict';

const joi = require('joi');

/**
 * Build Commands
 */
class CmdBuilder {

  static eslint(options) {
    const schema = joi.object().keys({
      eslintrcPath: joi.string().default(''),
      checkstyleExport: joi.boolean().default(true),
      checkstyleExportPath: joi.string().default('artifacts/eslint/eslint.xml'),
      customLintArg: joi.string().default('')
    }).unknown();

    let lintOptions = joi.validate(options || {}, schema);

    if (lintOptions.error) {
      throw new Error('Eslint config validation error: ' + lintOptions.error.message);
    }

    lintOptions = lintOptions.value;

    let cmd = 'eslint';

    if (lintOptions.eslintrcPath !== '') {
      cmd += ' -c ' + lintOptions.eslintrcPath;
    }

    if (lintOptions.checkstyleExport) {
      cmd += ' -f checkstyle';
    }

    if (lintOptions.customLintArg !== '') {
      cmd += ' ' + lintOptions.customLintArg;
    }

    if (lintOptions.checkstyleExport && lintOptions.checkstyleExportPath) {
      cmd += ' > ' + lintOptions.checkstyleExport;
    }

    return cmd;
  }
}

module.exports = CmdBuilder;
