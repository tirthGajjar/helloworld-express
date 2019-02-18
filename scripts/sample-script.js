'use strict';

// if (process.env.NODE_ENV === 'production') {
//   process.exit(0);
// }

process.env.INSTANCE_ID = 'script';

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const EVENT = require('@/common/events');

const CONFIG = require('@/common/config');

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
    Logger.info('processing ...');

    // @PLACEHOLDER for custom scripts

    Logger.info('done');
    EVENT.emit('shutdown');
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    EVENT.emit('shutdown', 1);
  }
})();

EVENT.once('shutdown', teardown);
