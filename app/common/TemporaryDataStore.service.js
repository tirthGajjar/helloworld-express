'use strict';

/** @module common/TemporaryDataStore */

const DataRedisStorage = require('./data/redis.storage');

/**
 * retrieve `key` from redis store
 *
 * @param {string} key
 * @param {*} defaultValue
 */
async function retrieve(key, defaultValue = null) {
  const value = await DataRedisStorage.client.get(key);
  return value ? JSON.parse(value) : defaultValue;
}

/**
 * store `value` with `key` in redis store
 *
 * @param {string} key
 * @param {*} value
 */
async function store(key, value) {
  if (typeof value === 'undefined') {
    value = null;
  }
  await DataRedisStorage.client.set(key, JSON.stringify(value));
}

/**
 * clear `key` from redis store
 *
 * @param {*} key
 */
async function clear(key) {
  await DataRedisStorage.client.del(key);
}

/**
 * store `value` with `key` and expiry in redis store
 *
 * @param {string} key
 * @param {*} value
 * @param {number} expiry - in seconds
 */
async function storeWithExpiry(key, value, expiry) {
  if (typeof value === 'undefined') {
    value = null;
  }
  await DataRedisStorage.client.setex(key, expiry, JSON.stringify(value));
}

module.exports = {
  retrieve,
  store,
  clear,
  storeWithExpiry,
};
