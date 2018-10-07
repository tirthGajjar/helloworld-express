'use strict';

process.env.INSTANCE_ID = process.env.INSTANCE_ID || `core-${process.env.NODE_APP_INSTANCE || '0'}`;

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

require('@/common/dal');

const glob = require('glob');
const path = require('path');

const EVENT = require('@/common/events');

EVENT.once('dal-ready', (DAL) => {
  glob.sync('app/**/*.core.js').forEach((filename) => {
    Logger.debug('loading', filename);
    require(path.resolve(filename));
  });

  process.nextTick(() => {
    Logger.debug('ready');
    EVENT.emit('core-ready');
  });

  EVENT.once('shutdown', () => {
    Logger.debug('Waterline teardown ...');
    DAL.waterline.teardown((err) => {
      Logger.debug('Waterline teardown done.', err || '');
    });
  });
});
