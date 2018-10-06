'use strict';

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

process.env.INSTANCE_ID = 'script';

process.env.DB_MIGRATE = 'drop';

require('@/common/init');

require('@/common/orm');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const EVENT = require('@/common/events');

EVENT.once('orm-ready', async (ORM) => {
  Logger.debug('Database initialization');

  const glob = require('glob');
  const path = require('path');

  await Promise.all(
    glob.sync('app/**/*.seed.js').map(async (filename) => {
      const seed = require(path.resolve(filename));
      await seed(ORM);
    }),
  );

  Logger.debug('Database initialization done');

  process.exit(0);
});
