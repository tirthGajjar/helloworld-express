'use strict';

const CONST = require('@/common/const');

const DataMixin = require('@/common/data.mixin');

const definition = {
  identity: 'user',

  tableName: 'User',

  attributes: {
    role: {
      type: 'string',
      required: true,
      validations: {
        isIn: Object.values(CONST.ROLE),
      },
    },
    password: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
      required: true,
      validations: {
        isEmail: true,
      },
      // @TODO make unique
    },
    name: {
      type: 'string',
      required: true,
      // @TODO add index
    },
    picture_uri: {
      type: 'string',
      required: true,
    },

    created_at: { ...DataMixin.attributes.created_at },

    updated_at: { ...DataMixin.attributes.updated_at },

    _client: {
      model: 'client',
    },
  },

  customToJSON() {
    const { password, ...record } = DataMixin.customToJSON(this);
    return record;
  },
};

const helpers = {};

module.exports = {
  definition,
  helpers,
  collection: null,
};
