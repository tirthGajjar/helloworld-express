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

    glob.sync('app/**/*.job.js').forEach(async (filename) => {
      const job = require(path.resolve(filename));
      job.queue.process(job.worker);
    });

    Logger.debug('ready');
    process.nextTick(() => EVENT.emit('job-ready'));
  } catch (error) {
    Logger.error(error);
    process.exit(1);
  }
})();

EVENT.once('shutdown', async () => {
  await Job.teardown();
  await Data.teardown();
});
