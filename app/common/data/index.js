'use strict';

/** @module common/data */

const EVENT = require('@/common/events');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const DataWaterline = require('./waterline');
const DataGraphql = require('./graphql');
const DataRedisStorage = require('./redis.storage');
const DataRedisCache = require('./redis.cache');

const bootstrap = require('../bootstrap');

class Data {
  constructor() {
    this.Waterline = null;
    this.Graphql = null;
    this.RedisStorage = null;
    this.RedisCache = null;
  }

  /**
   * setup
   *
   * @returns {Promise}
   */
  async setup() {
    Logger.info('setup ...');

    await Promise.all([
      DataWaterline.setup().then(() => DataGraphql.setup()),
      DataRedisStorage.setup(),
      DataRedisCache.setup(),
    ]);

    this.Waterline = DataWaterline;
    this.Graphql = DataGraphql;
    this.RedisStorage = DataRedisStorage;
    this.RedisCache = DataRedisCache;

    await bootstrap();

    EVENT.emit('data-ready', module.exports);

    Logger.info('setup done');
  }

  /**
   * teardown
   *
   * @returns {Promise}
   */
  async teardown() {
    Logger.info('teardown ...');

    await Promise.all([
      DataWaterline.teardown(),
      DataGraphql.teardown(),
      DataRedisStorage.teardown(),
      DataRedisCache.teardown(),
    ]);

    this.Waterline = null;
    this.Graphql = null;
    this.RedisStorage = null;
    this.RedisCache = null;

    Logger.info('teardown done');
  }

  /**
   * clear
   *
   * @returns {Promise}
   */
  async clear() {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    await Promise.all([DataWaterline.clear(), DataGraphql.clear(), DataRedisStorage.clear(), DataRedisCache.clear()]);
  }
}

module.exports = new Data();
