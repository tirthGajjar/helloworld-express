'use strict';

/** @module common/data/redisCache */

const CONFIG = require('@/common/config');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const Redis = require('redis');
const RedisCommands = require('redis-commands');

const { promisify } = require('util');

class DataRedisCache {
  constructor() {
    this.client = null;
  }

  setup() {
    return new Promise((resolve, reject) => {
      Logger.info('setup ...');

      this.client = Redis.createClient(CONFIG.REDIS_CACHE_URI);

      this.client.on('error', reject);

      this.client.on('ready', () => {
        Logger.info('setup done');

        RedisCommands.list.forEach((command) => {
          this.client[command] = promisify(this.client[command]).bind(this.client);
        });

        resolve(this.client);
      });
    });
  }

  teardown() {
    return new Promise((resolve, reject) => {
      Logger.info('teardown ...');

      if (!this.client) {
        Logger.info('teardown done');
        resolve();
        return;
      }

      this.client.quit((err) => {
        Logger.info('teardown done', err || '');

        this.client = null;

        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  clear() {
    return this.client.flushdb();
  }
}

module.exports = new DataRedisCache();
