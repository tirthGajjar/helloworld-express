'use strict';

const CONFIG = require('@/common/config');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const path = require('path');

const APP_CONFIG = require('../../app-config');

module.exports = async () => {
  if (!CONFIG.IS_CORE) {
    return;
  }

  for (const filename of APP_CONFIG.BOOTSTRAP_FILES) {
    Logger.info('loading', filename);
    const bootstrap = require(path.resolve(filename));
    await bootstrap();
  }
};
