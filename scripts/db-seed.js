'use strict';

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

process.env.INSTANCE_ID = 'script';

require('@/common/init');

process.env.DAL_MIGRATE = 'drop';

require('@/common/dal');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const EVENT = require('@/common/events');

const glob = require('glob');
const path = require('path');

(async () => {
  try {
    Logger.debug('processing ...');

    const DAL = await EVENT.toPromise('dal-ready');

    await Promise.all(
      glob.sync('app/**/*.seed.js').map(async (filename) => {
        const seed = require(path.resolve(filename));
        await seed(DAL);
      }),
    );

    Logger.debug('done');
    process.exit(0);
  } catch (error) {
    Logger.error(error);
    process.exit(1);
  }
})();
