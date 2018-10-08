'use strict';

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

process.env.INSTANCE_ID = 'script';

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const Data = require('@/common/data');

(async () => {
  try {
    Logger.debug('initiating ...');

    await Data.setup();

    Logger.debug('processing ...');

    /**
     * @PLACEHOLDER for custom scripts
     */

    Logger.debug('done');
    process.exit(0);
  } catch (error) {
    Logger.error(error);
    process.exit(1);
  }
})();
