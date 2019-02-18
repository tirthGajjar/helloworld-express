'use strict';

process.env.INSTANCE_ID = process.env.INSTANCE_ID || `job-${process.env.NODE_APP_INSTANCE || '0'}`;

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const glob = require('glob');
const path = require('path');

const EVENT = require('@/common/events');

const Data = require('@/common/data');
const Job = require('@/common/job');

async function setup() {
  await Data.setup();
  await Job.setup();
}

async function teardown() {
  await Job.teardown();
  await Data.teardown();
}

(async () => {
  try {
    Logger.info('initiating ...');
    await setup();

    let jobs = process.env.JOBS || 'app/**/*.job.js';

    jobs = jobs
      .split(',')
      .reduce((acc, item) => [...acc, ...(item.indexOf('*') !== '-1' ? glob.sync(item) : [item])], []);

    jobs = Array.from(new Set(jobs));

    jobs.forEach(async (filename) => {
      Logger.info('loading', filename);
      const job = require(path.resolve(filename));
      Logger.debug('job', job.name);
      if (job.setup) {
        await job.setup();
      }
      if (Array.isArray(job.processor)) {
        job.processor.forEach((processor) => {
          job.queue.process(processor.name, processor.concurrency || 1, processor.processor);
        });
      } else {
        job.queue.process('*', job.concurrency || 1, job.processor);
      }

      job.queue
        .on('error', (error) => {
          Logger.error(error);
        })
        .on('waiting', (jobId) => {
          Logger.info(jobId);
        })
        .on('active', (job, jobPromise) => {
          Logger.info('job', job.queue.name, job.id, 'active', job.data);
        })
        .on('stalled', (job) => {
          Logger.info('job', job.queue.name, job.id, 'stalled');
        })
        .on('progress', (job, progress) => {
          Logger.info('job', job.queue.name, job.id, 'progress', progress);
        })
        .on('completed', (job, result) => {
          Logger.info('job', job.queue.name, job.id, 'completed');
        })
        .on('failed', (job, err) => {
          Logger.error('job', job.queue.name, job.id, err);
        })
        .on('paused', () => {
          Logger.info('job', job.queue.name, job.id, 'paused');
        })
        .on('resumed', (job) => {
          Logger.info('job', job.queue.name, job.id, 'resumed');
        })
        .on('cleaned', (jobs, type) => {
          Logger.info('job', job.queue.name, job.id, 'cleaned', type, jobs.length);
        })
        .on('drained', () => {
          Logger.info('drained');
        })
        .on('removed', (job) => {
          Logger.info('job', job.queue.name, job.id, 'removed');
        });
    });

    Logger.info('ready');
    process.nextTick(() => EVENT.emit('job-ready'));
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    EVENT.emit('shutdown', 1);
  }
})();

EVENT.once('shutdown', teardown);
