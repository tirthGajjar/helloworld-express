'use strict';

const glob = require('glob');
const path = require('path');

// const SEED = glob.sync('app/**/*.seed.js');
const SEED = ['app/module/auth/auth.seed.js', 'app/module/task/task.seed.js'];

module.exports = {
  SEED,
};
