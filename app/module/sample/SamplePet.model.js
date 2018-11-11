'use strict';

const DataMixin = require('@/common/data.mixin');

const definition = {
  identity: 'sample_pet',

  tableName: 'SamplePet',

  attributes: {
    breed: {
      type: 'string',
    },

    type: {
      type: 'string',
    },

    name: {
      type: 'string',
    },

    _person: {
      model: 'sample_person',
    },
  },
};

const helpers = {};

module.exports = {
  definition,
  helpers,
  collection: null,
};
