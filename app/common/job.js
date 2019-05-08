'use strict';

const path = require('path');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const APP_CONFIG = require('../../app-config');

class Job {
  constructor() {
    this.queues = {};
  }

  async setup() {
    Logger.info('setup ...');

    APP_CONFIG.JOB_FILES.forEach((filename) => {
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
