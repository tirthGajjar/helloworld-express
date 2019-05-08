'use strict';

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

process.env.INSTANCE_ID = 'core';
process.env.MIGRATE = 'drop';

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const path = require('path');

const EVENT = require('@/common/events');

const Data = require('@/common/data');

const APP_CONFIG = require('../app-config');

async function setup() {
  await Data.setup();
}

async function teardown() {
  await Data.teardown();
}

(async () => {
  try {
    Logger.info('initiating ...');
    await setup();
    Logger.info('processing ...');

    for (const filename of APP_CONFIG.SEED_FILES) {
      Logger.info('loading', filename);
      const seed = require(path.resolve(filename));
      await seed();
    }

    Logger.info('done');
    EVENT.emit('shutdown');
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    EVENT.emit('shutdown', 1);
  }
})();

EVENT.once('shutdown', teardown);
