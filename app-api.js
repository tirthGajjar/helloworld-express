'use strict';

process.env.INSTANCE_ID = process.env.INSTANCE_ID || `api-${process.env.NODE_APP_INSTANCE || '0'}`;

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const EVENT = require('@/common/events');

const Data = require('@/common/data');
const Job = require('@/common/job');
const Express = require('@/common/express');

async function setup() {
  await Data.setup();
  await Job.setup();
  await Express.setup();
}

async function teardown() {
  await Express.teardown();
  await Job.teardown();
  await Data.teardown();
}

(async () => {
  try {
    Logger.info('initiating ...');
    await setup();
    Logger.info('ready');
    process.nextTick(() => EVENT.emit('api-ready'));
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    EVENT.emit('shutdown', 1);
  }
})();

EVENT.once('shutdown', teardown);
