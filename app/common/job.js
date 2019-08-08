'use strict';

const Logger = require('~/common/logger').createLogger($filepath(__filename));

const APP_CONFIG = require('../../app-config');

class Job {
  constructor() {
    this.queues = {};
  }

  async setup() {
    Logger.info('setup ...');

    APP_CONFIG.JOB_FILES.forEach((filename) => {
      Logger.info('loading', filename);
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const job = require(filename);
      this.queues[job.name] = job.queue;
    });

    Logger.info('setup done');
  }

  async run() {
    APP_CONFIG.JOB_RUN_FILES.forEach(async (filename) => {
      Logger.info('loading', filename);
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const job = require(filename);
      Logger.debug('job', job.name);

      if (job.setup) {
        await job.setup();
      }

      if (Array.isArray(job.processor)) {
        job.processor.forEach((process) => {
          job.queue.process(process.name, process.concurrency || 1, process.processor);
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
  }

  async shutdown() {
    Logger.info('shutdown ...');

    await Promise.all(Object.values(this.queues).map((queue) => queue.close()));

    this.queues = {};

    Logger.info('shutdown done');
  }
}

module.exports = new Job();
