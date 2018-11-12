'use strict';

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

process.env.INSTANCE_ID = 'script';

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const EVENT = require('@/common/events');

const Data = require('@/common/data');
const Job = require('@/common/job');

(async () => {
  try {
    Logger.info('initiating ...');

    await Data.setup();
    await Job.setup();

    Logger.info('processing ...');

    // @PLACEHOLDER for custom scripts

    Logger.info('done');
    process.exit(0);
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    process.exit(1);
  }
})();

EVENT.once('shutdown', async () => {
  await Job.teardown();
  await Data.teardown();
});
