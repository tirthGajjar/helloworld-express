'use strict';

const CONFIG = require('@/common/config');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const glob = require('glob');
const path = require('path');

module.exports = async () => {
  if (!CONFIG.IS_CORE) {
    return;
  }

  const FILES = glob.sync('app/**/*.initialize.js');

  await Promise.all(
    FILES.map(async (filename) => {
      Logger.info('loading', filename);
      const initialize = require(path.resolve(filename));
      await initialize();
    }),
  );
};
