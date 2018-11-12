'use strict';

const glob = require('glob');
const path = require('path');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const queues = {};

async function setup() {
  Logger.info('initiating ...');

  glob.sync('app/**/*.job.js').forEach((filename) => {
    Logger.info('loading', filename);
    const job = require(path.resolve(filename));
    queues[job.name] = job.queue;
  });

  Logger.info('ready');
}

async function teardown() {
  Logger.info('teardown ...');
  // @TODO
  Logger.info('teardown done.');
}

module.exports = {
  setup,
  teardown,
  queues,
};
