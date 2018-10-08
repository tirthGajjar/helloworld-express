'use strict';

const CONFIG = require('@/common/config');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const Queue = require('bull');

const name = 'sample_task';

const queue = new Queue(name, CONFIG.REDIS_URI);

async function worker(job) {
  Logger.debug('worker', job.id, job.data);
}

module.exports = {
  name,
  queue,
  worker,
};

if (process.env.INSTANCE_ID === 'core') {
  setInterval(() => {
    Logger.debug('adding sample job');

    queue.add({ data: new Date() });
  }, 5000);
}
