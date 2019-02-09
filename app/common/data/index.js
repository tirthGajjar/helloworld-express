'use strict';

/** @module Data */

const EVENT = require('@/common/events');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const DataWaterline = require('./waterline');
const DataGraphql = require('./graphql');
const DataRedisStorage = require('./redis.storage');
const DataRedisCache = require('./redis.cache');

const initialize = require('./initialize');

async function setup() {
  Logger.info('setup ...');

  await Promise.all([
    DataWaterline.setup().then(() => DataGraphql.setup()),
    DataRedisStorage.setup(),
    DataRedisCache.setup(),
  ]);

  module.exports.waterline = DataWaterline;
  module.exports.graphql = DataGraphql;
  module.exports.redisStorage = DataRedisStorage;
  module.exports.redisCache = DataRedisCache;

  await initialize();

  EVENT.emit('data-ready', module.exports);

  Logger.info('setup done');
}

async function teardown() {
  Logger.info('teardown ...');

  await Promise.all([
    DataWaterline.teardown(),
    DataGraphql.teardown(),
    DataRedisStorage.teardown(),
    DataRedisCache.teardown(),
  ]);

  module.exports.waterline = null;
  module.exports.graphql = null;
  module.exports.redisStorage = null;
  module.exports.redisCache = null;

  Logger.info('teardown done');
}

async function clear() {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  await Promise.all([DataWaterline.clear(), DataGraphql.clear(), DataRedisStorage.clear(), DataRedisCache.clear()]);
}

module.exports = {
  setup,
  teardown,
  clear,
};
