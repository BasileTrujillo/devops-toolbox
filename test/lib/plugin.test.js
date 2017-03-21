'use strict';

const chai = require('chai');
const expect = chai.expect;
const Plugin = require('../../lib/plugin');

describe('Plugin', () => {
  it('Should fail to run the default plugin function', () => {
    const plugin = new Plugin();

    expect(() => plugin.run()).to.throw(Error, /No "default" function found/);
  });

  it('Should validate options', () => {
    const options = {
      redirectedOutput: true,
      custom: 'foo'
    };
    const plugin = new Plugin(options);

    const validatedOptions = plugin.validateOptions();

    expect(validatedOptions).to.be.an.instanceof(Object);
    expect(validatedOptions).to.have.property('redirectedOutput', options.redirectedOutput);
    expect(validatedOptions).to.have.property('custom', options.custom);
  });
});
