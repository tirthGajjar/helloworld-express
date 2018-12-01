'use strict';

/** @module Data */

const Store = require('@/module/shared/store.model');

/**
 * retrieve `key` from mongo store
 *
 * @param {string} key
 */
async function retrieve(key) {
  const record = await Store.collection.findOne(key);
  return record ? record.value || null : null;
}

/**
 * store `value` with `key` in mongo store
 *
 * @param {string} key
 * @param {*} value
 */
async function store(key, value) {
  if (typeof value === 'undefined') {
    value = null;
  }

  const record = await Store.collection.findOne(key);
  if (record) {
    await Store.collection.update(key, { value });
  } else {
    await Store.collection.create({ id: key, value });
  }
}

/**
 * clear `key` from mongo store
 *
 * @param {*} key
 */
async function clear(key) {
  await Store.collection.destroyOne(key);
}

/**
 * retrieve `key` from mongo store or store it if not already set
 *
 * @param {string} key
 * @param {*} value
 */
async function retrieveOrStore(key, value) {
  if (typeof value === 'undefined') {
    value = null;
  }

  const record = await Store.collection.findOrCreate(
    {
      id: key,
    },
    {
      id: key,
      value,
    },
  );

  return record ? record.value || null : null;
}

module.exports = {
  retrieve,
  store,
  clear,
  retrieveOrStore,
};
