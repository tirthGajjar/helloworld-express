'use strict';

/** @module Data */

const DataRedisStorage = require('./data/redis.storage');

/**
 * retrieve `key` from redis store
 *
 * @param {string} key
 */
async function retrieve(key) {
  let value = await DataRedisStorage.client.get(key);
  value = value ? JSON.parse(value) : null;
  return value;
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
