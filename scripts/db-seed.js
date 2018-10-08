'use strict';

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

process.env.INSTANCE_ID = 'script';

require('@/common/init');

process.env.MIGRATE = 'drop';

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const Data = require('@/common/data');

const glob = require('glob');
const path = require('path');

(async () => {
  try {
    Logger.debug('initiating ...');

    await Data.setup();

    Logger.debug('processing ...');

    await Promise.all(
      glob.sync('app/**/*.seed.js').map(async (filename) => {
        const seed = require(path.resolve(filename));
        await seed();
      }),
    );

    Logger.debug('done');
    process.exit(0);
  } catch (error) {
    Logger.error(error);
    process.exit(1);
  }
})();
