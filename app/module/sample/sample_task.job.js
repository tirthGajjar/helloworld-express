'use strict';

const CONFIG = require('@/common/config');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const Queue = require('bull');

const name = 'sample_task';

const queue = new Queue(name, CONFIG.REDIS_URI);

async function handler(job) {
  Logger.debug('handler', job.id, job.data);
}

module.exports = {
  name,
  queue,
  handler,
};
