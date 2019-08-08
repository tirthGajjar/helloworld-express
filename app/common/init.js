'use strict';

const path = require('path');

/*
 * Load polyfills
 */

require('./polyfill');

/*
 * Define global relative file path helper
 */

const FILENAME_PREFIX_LENGTH = path.normalize(`${__dirname}/../..`).length + 1;

const JOBNAME_PREFIX_LENGTH = FILENAME_PREFIX_LENGTH + 4;

function $filepath(filename) {
  return filename.slice(FILENAME_PREFIX_LENGTH, -3);
}

function $jobname(filename) {
  return filename
    .slice(JOBNAME_PREFIX_LENGTH, -7)
    .replace(/^module\//, '')
    .replace(/^shared\/job\//, 'shared/')
    .replace(/\//g, '$');
}

Object.assign(global, {
  $filepath,
  $jobname,
});

/*
 * Load environment variables
 */

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const dotenv = require('dotenv');
const fs = require('fs');

[`.env.${process.env.NODE_ENV}.local`, `.env.${process.env.NODE_ENV}`, '.env.local', '.env'].forEach((filename) => {
  if (fs.existsSync(filename)) {
    dotenv.config({
      path: filename,
    });
  }
});

process.env.MIGRATE = process.env.INSTANCE_ID === 'core' ? process.env.MIGRATE || 'safe' : 'safe';

/*
 * Load global event bus
 */

const EVENT = require('./events');

/*
 * Load configurations
 */

const CONFIG = require('./config');

/*
 * Setup Logger
 */

const Logger = require('./logger');

const PREFIX = 'HelloWorld';

Logger.setup(PREFIX);

if (!CONFIG.IS_TEST && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
  Logger.enable(`${PREFIX}*`);
}

/*
 * Shutdown handling
 */

process.on('SIGINT', () => {
  Logger.debug('shutdown initiated ...');
  process.nextTick(() => EVENT.emit('shutdown'));
});

EVENT.once('shutdown', (code = 0) => {
  setTimeout(() => {
    Logger.debug('exiting');
    process.nextTick(() => process.exit(code));
  }, 1000);
});

/**
 * Other
 */

if (process.env.NODE_ENV === 'development') {
  Logger.debug('CONFIG', JSON.stringify(CONFIG, null, 2));
}
