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

const Task = require('./Task.model');

(async () => {
  try {
    Logger.debug('initiating ...');

    await Data.setup();
    await Job.setup();

    Logger.debug('processing ...');

    const records = await Task.collection.find().where({});

    Logger.debug(records);
    Logger.debug(JSON.stringify(records, null, 2));

    Logger.debug('done');
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
