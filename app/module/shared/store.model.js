'use strict';

const definition = {
  identity: 'store',

  tableName: 'store',

  attributes: {
    key: {
      type: 'string',
      required: true,
    },
    value: {
      type: 'json',
      required: true,
    },
  },

  beforeUpdate(record, next) {
    if ('key' in record) {
      delete record.key;
    }

    next();
  },

  async onBeforeReady(Model, nativeCollection) {
    await nativeCollection.ensureIndex(
      {
        key: 1,
      },
      {
        unique: true,
      },
    );
  },
};

const helpers = {};

module.exports = {
  definition,
  helpers,
  collection: {},
};
