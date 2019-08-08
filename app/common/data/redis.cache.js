'use strict';

/** @module common/data/redis.cache */

const Redis = require('redis');
// eslint-disable-next-line import/no-extraneous-dependencies
const RedisCommands = require('redis-commands');

const { promisify } = require('util');

const Logger = require('~/common/logger').createLogger($filepath(__filename));
const CONFIG = require('~/common/config');

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

  shutdown() {
    return new Promise((resolve, reject) => {
      Logger.info('shutdown ...');

      if (!this.client) {
        Logger.info('shutdown done');
        resolve();
        return;
      }

      this.client.quit((err) => {
        Logger.info('shutdown done', err || '');

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
