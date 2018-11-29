'use strict';

const glob = require('glob');
const path = require('path');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const queues = {};

async function setup() {
  Logger.info('setup ...');

  glob.sync('app/**/*.job.js').forEach((filename) => {
    Logger.info('loading', filename);
    const job = require(path.resolve(filename));
    queues[job.name] = job.queue;
  });

  Logger.info('setup done');
}

async function teardown() {
  Logger.info('teardown ...');

  await Promise.all(Object.values(queues).map((queue) => queue.close()));

  Logger.info('teardown done');
}

module.exports = {
  setup,
  teardown,
  queues,
};
