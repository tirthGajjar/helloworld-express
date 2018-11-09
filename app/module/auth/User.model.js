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
    },
    name: {
      type: 'string',
      required: true,
    },
    picture_uri: {
      type: 'string',
      required: true,
    },

    created_at: { ...DataMixin.attribute.created_at },

    updated_at: { ...DataMixin.attribute.updated_at },

    _client: {
      model: 'client',
    },
  },

  customToJSON() {
    const { password, ...record } = DataMixin.customToJSON(this);
    return record;
  },
};

module.exports = {
  definition,
  collection: {},
};
