#!/usr/bin/env node --harmony

'use strict';

const Executor = require('./lib/executor');

const executor = new Executor({
  debug: true,
  verbose: true
});

executor.execCmd('eslint');
