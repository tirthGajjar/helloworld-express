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
  /**
   * @PLACEHOLDER for custom scripts
   */

  process.exit(0);
});
