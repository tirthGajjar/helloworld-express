'use strict';

const glob = require('glob');

const DATA_MODEL_FILES = [...new Set([...glob.sync('app/**/*.model.js')])];

const ROUTER_FILES = [...new Set([...glob.sync('app/**/*.router.js')])];

const GRAPHQL_FILES = [...new Set([...glob.sync('app/**/*.graphql.js')])];

const JOB_FILES = [...new Set([...glob.sync('app/**/*.job.js')])];

const JOB_RUNNER_FILES = [
  ...new Set([
    ...(process.env.JOBS_TO_RUN || 'app/**/*.job.js')
      .split(',')
      .reduce((acc, item) => [...acc, ...(item.indexOf('*') !== '-1' ? glob.sync(item) : [item])], []),
  ]),
];

const BOOTSTRAP_FILES = [...new Set([...glob.sync('app/**/*.bootstrap.js')])];

const SEED_FILES = [...new Set(['app/module/auth/auth.seed.js', ...glob.sync('app/**/*.seed.js')])];

module.exports = {
  DATA_MODEL_FILES,
  ROUTER_FILES,
  GRAPHQL_FILES,
  JOB_FILES,
  JOB_RUNNER_FILES,
  BOOTSTRAP_FILES,
  SEED_FILES,
};
