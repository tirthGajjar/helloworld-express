'use strict';

const glob = require('glob');
// const path = require('path');

function normalize(file) {
  // return path.resolve(file);
  return file.replace(/^app\//, '~/').replace(/\.js$/, '');
}

const MODEL_FILES = [...new Set([...glob.sync('app/**/*.model.js')])].map(normalize);

const API_FILES = [...new Set([...glob.sync('app/**/*.api.js')])].map(normalize);

const GRAPHQL_FILES = [...new Set([...glob.sync('app/**/*.graphql.js')])].map(normalize);

const JOB_FILES = [...new Set([...glob.sync('app/**/*.job.js')])].map(normalize);

const JOB_RUN_FILES = [
  ...new Set([
    ...(process.env.TARGET_JOBS || 'app/**/*.job.js')
      .split(',')
      .reduce((acc, item) => [...acc, ...(item.indexOf('*') !== '-1' ? glob.sync(item) : [item])], []),
  ]),
].map(normalize);

const BOOTSTRAP_FILES = [...new Set([...glob.sync('app/**/*.bootstrap.js')])].map(normalize);

const SEED_FILES = [...new Set(['app/module/auth/auth.seed.js', ...glob.sync('app/**/*.seed.js')])].map(normalize);

module.exports = {
  MODEL_FILES,
  API_FILES,
  GRAPHQL_FILES,
  JOB_FILES,
  JOB_RUN_FILES,
  BOOTSTRAP_FILES,
  SEED_FILES,
};
