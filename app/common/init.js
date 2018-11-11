'use strict';

/*
 * Load polyfills
 */

require('@/common/polyfill');

/*
 * Define global relative file path helper
 */

const FILENAME_PREFIX_LENGTH = require('path').normalize(`${__dirname}/../..`).length + 1;

const JOBNAME_PREFIX_LENGTH = FILENAME_PREFIX_LENGTH + 4;

global.$filepath = function (filename) {
  return filename.slice(FILENAME_PREFIX_LENGTH, -3);
};

global.$jobname = function (filename) {
  return filename
    .slice(JOBNAME_PREFIX_LENGTH, -7)
    .replace(/^module\//, '')
    .replace(/^shared\/job\//, 'shared/')
    .replace(/\//g, '$');
};

/*
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

process.env.MIGRATE = process.env.INSTANCE_ID === 'core' ? process.env.MIGRATE || 'safe' : 'safe';

/*
 * Setup Logger
 */

const Logger = require('@/common/logger');

const PREFIX = 'app';

Logger.setup(PREFIX);

if (process.env.NODE_ENV === 'development') {
  Logger.enable(`${PREFIX}*`);
}

if (process.env.NODE_ENV === 'test') {
  Logger.enable(`${PREFIX}-test`);
}

/*
 * Load global event bus
 */

const EVENT = require('@/common/events');

/*
 * Load configurations
 */

const CONFIG = require('@/common/config');

if (process.env.NODE_ENV === 'development') {
  Logger.debug('CONFIG', JSON.stringify(CONFIG, null, 2));
}

/*
 * Shutdown handling
 */

process.on('SIGINT', () => {
  Logger.debug('shutdown initiated ...');
  process.nextTick(() => EVENT.emit('shutdown'));
  setTimeout(() => {
    Logger.debug('exiting.');
    process.nextTick(() => process.exit(0));
  }, 1000);
});
