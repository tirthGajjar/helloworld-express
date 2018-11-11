'use strict';

const DataMixin = require('@/common/data.mixin');

const definition = {
  identity: 'client',

  tableName: 'Client',

  attributes: {
    _user: {
      model: 'user',
    },
  },
};

const helpers = {};

module.exports = {
  definition,
  helpers,
  collection: null,
};
