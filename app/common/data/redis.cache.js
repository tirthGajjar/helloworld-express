'use strict';

/** @module common/data/redisCache */

const CONFIG = require('@/common/config');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const Redis = require('redis');
const RedisCommands = require('redis-commands');

const { promisify } = require('util');

let client = null;

async function setup() {
  return new Promise((resolve, reject) => {
    Logger.info('setup ...');

    client = Redis.createClient(CONFIG.REDIS_CACHE_URI);

    client.on('error', reject);

    client.on('ready', () => {
      Logger.info('setup done');

      RedisCommands.list.forEach((command) => {
        client[command] = promisify(client[command]).bind(client);
      });

      module.exports.client = client;

      resolve(client);
    });
  });
}

async function teardown() {
  return new Promise((resolve, reject) => {
    Logger.info('teardown ...');

    if (!client) {
      Logger.info('teardown done');
      resolve();
      return;
    }

    client.quit((err) => {
      Logger.info('teardown done', err || '');

      client = null;

      module.exports.client = null;

      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function clear() {
  return client.flushdb();
}

module.exports = {
  setup,
  teardown,
  clear,
  client,
};
