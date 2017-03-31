'use strict';

const chai = require('chai');
const expect = chai.expect;
const PluginLoader = require('../../lib/plugin-loader');

describe('PluginLoader', () => {
  it('Should load all plugins', () => {
    const loader = new PluginLoader({});

    return loader.loadAllPlugins().then(() => {
      expect(loader.plugins).to.be.instanceof(Object);
      expect(loader.plugins).to.have.property('plato');
      expect(loader.plugins).to.have.property('jsdoc');
      expect(loader.plugins).to.have.property('eslint');
      expect(loader.plugins).to.have.property('jshint');
      expect(loader.plugins).to.have.property('xo');
      expect(loader.plugins).to.have.property('custom-cmd');
      expect(loader.plugins).to.have.property('git-file-downloader');
      expect(loader.plugins).to.have.property('symlink-resolver');
      expect(loader.plugins).to.have.property('nsp');
      expect(loader.plugins).to.have.property('serverless');
      expect(loader.plugins).to.have.property('mocha');
      expect(loader.plugins).to.have.property('dpl');
    });
  });

  it('Should execute a stack', () => {
    const loader = new PluginLoader({
      myStack: {
        tasks: [
          {
            plugin: 'custom-cmd',
            cmd: 'ls'
          },
          {
            plugin: 'custom-cmd',
            cmd: 'pwd'
          }
        ]
      }
    });

    loader.loadAllPlugins().then(() => {
      expect(() => loader.execPlugins('myStack')).to.not.throw(Error);
    }).catch(error => { throw error; });
  });
});
