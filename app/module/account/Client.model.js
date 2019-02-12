'use strict';

const DataMixin = require('@/common/data/mixin');

const definition = {
  identity: 'client',

  tableName: 'Client',

  attributes: {
    _user: {
      model: 'user',
    },
  },

  graphql_settings: {
    count: false,
    index: false,
    item: false,
  },
};

const helpers = {};

module.exports = {
  definition,
  helpers,
  collection: {},
};
