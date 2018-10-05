'use strict';

process.env.INSTANCE_ID = process.env.INSTANCE_ID || `job-${process.env.NODE_APP_INSTANCE || '0'}`;

require('@/common/bootstrap');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

require('@/common/orm');

const glob = require('glob');
const path = require('path');

const EVENT = require('@/common/events');

EVENT.on('orm-ready', () => {
  glob.sync('app/**/*.job.js').forEach((filename) => {
    Logger.debug('loading', filename);
    require(path.resolve(filename));
  });
});

Logger.debug('Job runner started');
