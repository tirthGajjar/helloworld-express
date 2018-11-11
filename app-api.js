'use strict';

process.env.INSTANCE_ID = process.env.INSTANCE_ID || `api-${process.env.NODE_APP_INSTANCE || '0'}`;

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const EVENT = require('@/common/events');

const Data = require('@/common/data');
const Job = require('@/common/job');
const Express = require('@/common/express');

(async () => {
  try {
    Logger.debug('initiating ...');

    await Data.setup();
    await Job.setup();
    await Express.setup();

    Logger.debug('ready');
    process.nextTick(() => EVENT.emit('api-ready'));
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    process.exit(1);
  }
})();

EVENT.once('shutdown', async () => {
  await Express.teardown();
  await Job.teardown();
  await Data.teardown();
});
