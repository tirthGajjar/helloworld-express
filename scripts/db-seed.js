'use strict';

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

process.env.INSTANCE_ID = 'core';
process.env.MIGRATE = 'drop';

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const glob = require('glob');
const path = require('path');

const EVENT = require('@/common/events');

const Data = require('@/common/data');

(async () => {
  try {
    Logger.info('initiating ...');

    await Data.setup();

    Logger.info('processing ...');

    // const FILES = glob.sync('app/**/*.seed.js');
    const FILES = ['app/module/auth/auth.seed.js', 'app/module/task/task.seed.js'];

    // await Promise.all(
    //   FILES.map(async (filename) => {
    //     Logger.info('loading', filename);
    //     const seed = require(path.resolve(filename));
    //     await seed();
    //   }),
    // );

    for (const filename of FILES) {
      Logger.info('loading', filename);
      const seed = require(path.resolve(filename));
      await seed();
    }

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
