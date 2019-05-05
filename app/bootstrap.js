'use strict';

const CONFIG = require('@/common/config');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const glob = require('glob');
const path = require('path');

module.exports = async () => {
  if (!CONFIG.IS_CORE) {
    return;
  }

  const FILES = glob.sync('app/**/*.bootstrap.js');

  await Promise.all(
    FILES.map(async (filename) => {
      Logger.info('loading', filename);
      const bootstrap = require(path.resolve(filename));
      await bootstrap();
    }),
  );
};
