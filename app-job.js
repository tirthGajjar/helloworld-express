'use strict';

process.env.INSTANCE_ID = process.env.INSTANCE_ID || `job-${process.env.NODE_APP_INSTANCE || '0'}`;

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const glob = require('glob');
const path = require('path');

const EVENT = require('@/common/events');

const Data = require('@/common/data');
const Job = require('@/common/job');

(async () => {
  try {
    Logger.debug('initiating ...');

    await Data.setup();
    await Job.setup();

    let jobs = process.env.JOBS || 'app/**/*.job.js';

    jobs = jobs
      .split(',')
      .reduce((acc, item) => [...acc, ...(item.indexOf('*') !== '-1' ? glob.sync(item) : [item])], []);

    jobs = Array.from(new Set(jobs));

    jobs.forEach((filename) => {
      Logger.debug('loading', filename);
      const job = require(path.resolve(filename));
      Logger.debug('job', job.name);
      if (Array.isArray(job.processor)) {
        job.processor.forEach((processor) => {
          job.queue.process(processor.name, processor.concurrency || 1, processor.processor);
        });
      } else {
        job.queue.process('*', job.concurrency || 1, job.processor);
      }
    });

    Logger.debug('ready');
    process.nextTick(() => EVENT.emit('job-ready'));
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    process.exit(1);
  }
})();

EVENT.once('shutdown', async () => {
  await Job.teardown();
  await Data.teardown();
});
