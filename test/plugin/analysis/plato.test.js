'use strict';

const chai = require('chai');
const expect = chai.expect;
const Plugin = require('../../../plugin/analysis/plato');

describe('Plugin: Plato', () => {
  it('Should validate options', () => {
    const options = {
      outputDir: 'foo/bar',
      eslintrcPath: 'eslint.json',
      jshintrcPath: 'jshint.json',
      title: 'test',
      autoTitle: false,
      recurse: false,
    };
    const plugin = new Plugin(options);

    const validatedOptions = plugin.validateOptions();

    expect(validatedOptions).to.be.an.instanceof(Object);

    for (const key in options) {
      expect(validatedOptions).to.have.property(key, options[key]);
    }
  });
});
