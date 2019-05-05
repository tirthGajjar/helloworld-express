'use strict';

const glob = require('glob');
const path = require('path');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

class Job {
  constructor() {
    this.queues = {};
  }

  async setup() {
    Logger.info('setup ...');

    glob.sync('app/**/*.job.js').forEach((filename) => {
      Logger.info('loading', filename);
      const job = require(path.resolve(filename));
      this.queues[job.name] = job.queue;
    });

    Logger.info('setup done');
  }

  async teardown() {
    Logger.info('teardown ...');

    await Promise.all(Object.values(this.queues).map((queue) => queue.close()));

    this.queues = {};

    Logger.info('teardown done');
  }
}

module.exports = new Job();
