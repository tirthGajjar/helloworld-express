'use strict';

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

process.env.INSTANCE_ID = 'script';

process.env.DB_MIGRATE = 'drop';

require('@/common/bootstrap');

require('@/common/orm');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const EVENT = require('@/common/events');

Logger.debug('Database reset');

// dataUtils.reset(() => {
//   require('@/common/orm');
// });

// EVENT.once('orm-ready', async () => {
//   Logger.debug('Database reset done');
//   process.exit(0);
// });
