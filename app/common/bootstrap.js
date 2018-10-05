'use strict';

/**
 * Load polyfills
 */

require('@/common/polyfill');

/**
 * Define global relative file path helper
 */

const APP_ROOT = require('path').normalize(`${__dirname}/../..`);

global.$filepath = function (filename) {
  return filename.slice(APP_ROOT.length + 1, -3);
};

/**
 * Load environment variables
 */

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const dotenv = require('dotenv');
const fs = require('fs');

[`.env${process.env.NODE_ENV}.local`, `.env.${process.env.NODE_ENV}`, '.env.local', '.env'].forEach((filename) => {
  if (fs.existsSync(filename)) {
    dotenv.load({
      path: filename,
    });
  }
});

/**
 * Setup Logger
 */

const Logger = require('@/common/logger');

const PREFIX = 'HelloWorld';

Logger.setup(PREFIX);

if (process.env.NODE_ENV === 'development') {
  Logger.enable(`${PREFIX}*`);
}

if (process.env.NODE_ENV === 'test') {
  Logger.enable(`${PREFIX}*.test`);
}

/**
 * Load global event bus
 */

require('@/common/events');

/**
 * Load configurations
 */

const CONFIG = require('@/common/config');

if (process.env.NODE_ENV === 'development') {
  Logger.debug('CONFIG', JSON.stringify(CONFIG, null, 2));
}
