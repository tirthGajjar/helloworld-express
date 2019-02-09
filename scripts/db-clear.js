'use strict';

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

process.env.INSTANCE_ID = 'core';
process.env.MIGRATE = 'drop';

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const EVENT = require('@/common/events');

const Data = require('@/common/data');

(async () => {
  try {
    Logger.info('initiating ...');

    await Data.setup();

    Logger.info('processing ...');

    await Data.clear();

    Logger.info('done');
    EVENT.emit('shutdown');
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    process.exit(1);
  }
})();

EVENT.once('shutdown', async () => {
  await Data.teardown();
  process.exit(0);
});
