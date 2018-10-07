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

(async () => {
  try {
    Logger.debug('processing ...');

    await EVENT.toPromise('dal-ready');

    // do nothing since handled by DAL_MIGRATE

    Logger.debug('done');
    process.exit(0);
  } catch (error) {
    Logger.error(error);
    process.exit(1);
  }
})();
