'use strict';

const definition = {
  identity: 'store',

  tableName: 'store',

  primaryKey: 'id',

  // dontUseObjectIds: false,

  attributes: {
    id: {
      type: 'string',
      required: true,
      autoMigrations: {
        unique: true,
      },
    },
    value: {
      type: 'json',
      required: true,
    },
  },
};

const helpers = {};

module.exports = {
  definition,
  helpers,
  collection: {},
};
