'use strict';

process.env.INSTANCE_ID = process.env.INSTANCE_ID || `job-${process.env.NODE_APP_INSTANCE || '0'}`;

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

require('@/common/orm');

const glob = require('glob');
const path = require('path');

const EVENT = require('@/common/events');

EVENT.once('orm-ready', (ORM) => {
  glob.sync('app/**/*.job.js').forEach((filename) => {
    Logger.debug('loading', filename);
    require(path.resolve(filename));
  });

  process.nextTick(() => {
    Logger.debug('ready');
    EVENT.emit('job-ready');
  });

  EVENT.once('shutdown', () => {
    Logger.debug('Waterline teardown ...');
    ORM.teardown((err) => {
      Logger.debug('Waterline teardown done.', err || '');
    });
  });
});
