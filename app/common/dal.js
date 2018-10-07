'use strict';

const EVENT = require('@/common/events');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

module.exports = {
  utils: require('./dal.utils'),
};

// require('./dal.redis');
// require('./dal.mongo');
require('./dal.waterline');

Promise.all([
  EVENT.toPromise('waterline-ready').then((waterline) => {
    Logger.debug('waterline ready');
    module.exports.waterline = waterline;
  }),
]).then(() => EVENT.emit('dal-ready', module.exports));
