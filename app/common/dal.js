'use strict';

const EVENT = require('@/common/events');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

module.exports = {};

require('./dal.redis');
require('./dal.mongo');
require('./dal.waterline');

Promise.all([
  new Promise((resolve) => {
    EVENT.once('waterline-ready', (waterline) => {
      Logger.debug('waterline ready');
      module.exports.waterline = waterline;
      resolve();
    });
  }),
]).then(() => {
  EVENT.emit('dal-ready', module.exports);
});
