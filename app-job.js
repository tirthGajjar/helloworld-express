'use strict';

process.env.INSTANCE_ID = process.env.INSTANCE_ID || `job-${process.env.NODE_APP_INSTANCE || '0'}`;

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

require('@/common/dal');

const glob = require('glob');
const path = require('path');

const EVENT = require('@/common/events');

EVENT.once('dal-ready', (DAL) => {
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
    DAL.teardown((err) => {
      Logger.debug('Waterline teardown done.', err || '');
    });
  });
});
