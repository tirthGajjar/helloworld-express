'use strict';

const CONFIG = require('~/common/config');

const Logger = require('~/common/logger').createLogger($filepath(__filename));

const APP_CONFIG = require('../../app-config');

module.exports = async () => {
  if (!CONFIG.IS_CORE) {
    return;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const filename of APP_CONFIG.BOOTSTRAP_FILES) {
    Logger.info('loading', filename);
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const bootstrap = require(filename);
    // eslint-disable-next-line no-await-in-loop
    await bootstrap();
  }
};
