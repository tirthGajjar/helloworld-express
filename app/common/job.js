'use strict';

const glob = require('glob');
const path = require('path');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const queues = {};

async function setup() {
  Logger.debug('initiating ...');

  glob.sync('app/**/*.job.js').forEach((filename) => {
    Logger.debug('loading', filename);
    const job = require(path.resolve(filename));
    queues[job.name] = job.queue;
  });

  Logger.debug('ready');
}

async function teardown() {
  Logger.debug('teardown ...');
  // @TODO
  Logger.debug('teardown done.');
}

module.exports = {
  setup,
  teardown,
  queues,
};
