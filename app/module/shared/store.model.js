'use strict';

const definition = {
  identity: 'store',

  tableName: 'store',

  primaryKey: 'id',

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

  graphql_settings: {
    exclude: true,
  },
};

const helpers = {};

module.exports = {
  definition,
  helpers,
  collection: {},
};
