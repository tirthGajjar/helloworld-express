'use strict';

/** @module Data */

const EVENT = require('@/common/events');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const DataWaterline = require('./data.waterline');

async function setup() {
  await DataWaterline.setup();
}

async function teardown() {
  await DataWaterline.teardown();
}

Promise.all([
  EVENT.toPromise('waterline-ready').then(() => {
    module.exports.waterline = DataWaterline.waterline;
    module.exports.models = DataWaterline.models;
  }),
]).then(() => EVENT.emit('data-ready', module.exports));

module.exports = {
  setup,
  teardown,
};
