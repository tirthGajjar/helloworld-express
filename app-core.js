'use strict';

process.env.INSTANCE_ID = 'core';

require('~/common/init');

const Logger = require('~/common/logger').createLogger($filepath(__filename));

const EVENT = require('~/common/events');

const Data = require('~/common/data');
const Job = require('~/common/job');

async function setup() {
  await Data.setup();
  await Job.setup();
}

async function shutdown() {
  await Job.shutdown();
  await Data.shutdown();
}

(async () => {
  try {
    Logger.info('initiating ...');
    await setup();

    // run something here

    Logger.info('ready');
    process.nextTick(() => EVENT.emit('core-ready'));
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    EVENT.emit('shutdown', 1);
  }
})();

EVENT.once('shutdown', shutdown);
