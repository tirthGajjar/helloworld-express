'use strict';

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

process.env.INSTANCE_ID = 'script';

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

require('@/common/dal');

const EVENT = require('@/common/events');

EVENT.once('dal-ready', async (DAL) => {
  Logger.debug('Database seeding');

  const glob = require('glob');
  const path = require('path');

  await Promise.all(
    glob.sync('app/**/*.seed.js').map(async (filename) => {
      const seed = require(path.resolve(filename));
      await seed(DAL);
    }),
  );

  Logger.debug('Database seeding done');

  process.exit(0);
});
