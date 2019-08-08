'use strict';

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

process.env.INSTANCE_ID = 'core';
process.env.MIGRATE = 'drop';

require('~/common/init');

const Logger = require('~/common/logger').createLogger($filepath(__filename));

const EVENT = require('~/common/events');

const Data = require('~/common/data');

const APP_CONFIG = require('../app-config');

async function setup() {
  await Data.setup();
}

async function shutdown() {
  await Data.shutdown();
}

(async () => {
  try {
    Logger.info('initiating ...');
    await setup();
    Logger.info('processing ...');

    // eslint-disable-next-line no-restricted-syntax
    for (const filename of APP_CONFIG.SEED_FILES) {
      Logger.info('loading', filename);
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const seed = require(filename);
      // eslint-disable-next-line no-await-in-loop
      await seed();
    }

    Logger.info('done');
    EVENT.emit('shutdown');
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    EVENT.emit('shutdown', 1);
  }
})();

EVENT.once('shutdown', shutdown);
