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
    Logger.debug('initiating ...');

    await Data.setup();
    await Job.setup();

    Logger.debug('processing ...');

    let result;

    result = await Data.models.User.collection.find({ role: 'admin' });
    Logger.debug('find', result);

    result = await Data.models.User.collection.destroyOne(result[0].id);
    Logger.debug('destroyOne', result);

    result = await Data.models.User.collection.destroy({ role: 'admin' });
    Logger.debug('destroy', result);

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
