'use strict';

const CONFIG = require('@/common/config');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const Queue = require('bull');

const name = $jobname(__filename);

const queue = new Queue(name, CONFIG.REDIS_JOB_URI);

async function processor(job) {
  Logger.debug('sending email', job.id, job.data);
}

module.exports = {
  name,
  queue,
  processor,
};
