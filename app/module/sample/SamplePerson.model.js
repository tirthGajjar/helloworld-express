'use strict';

const DataMixin = require('@/common/data.mixin');

const definition = {
  identity: 'sample_person',

  tableName: 'SamplePerson',

  attributes: {
    firstName: {
      type: 'string',
      required: true,
    },

    lastName: {
      type: 'string',
      required: true,
    },

    fullName: {
      type: 'string',
    },

    created_at: { ...DataMixin.attributes.created_at },

    updated_at: { ...DataMixin.attributes.updated_at },

    _pets: {
      collection: 'sample_pet',
      via: '_person',
    },
  },

  beforeSave(record, next) {
    record.fullName = `${record.firstName} ${record.lastName}`;
    next();
  },
};

const helpers = {};

module.exports = {
  definition,
  helpers,
  collection: null,
};
