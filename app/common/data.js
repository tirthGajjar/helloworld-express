'use strict';

const EVENT = require('@/common/events');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const DataUtils = require('./data.utils');

const DataWaterline = require('./data.waterline');

async function setup() {
  await DataWaterline.setup();
}

async function teardown() {
  await DataWaterline.teardown();
}

Promise.all([
  EVENT.toPromise('waterline-ready').then((waterline) => {
    module.exports.waterline = waterline;
  }),
]).then(() => EVENT.emit('data-ready', module.exports));

module.exports = {
  utils: DataUtils,
  setup,
  teardown,
};
