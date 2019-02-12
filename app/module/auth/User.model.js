'use strict';

const CONST = require('@/common/const');

const DataMixin = require('@/common/data/mixin');

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
      autoMigrations: {
        unique: true,
      },
    },

    email_verified: {
      type: 'boolean',
      defaultsTo: false,
    },

    name: {
      type: 'string',
      required: true,
    },

    picture_uri: {
      type: 'string',
      defaultsTo: 'https://randomuser.me/api/portraits/lego/1.jpg',
    },

    created_at: { ...DataMixin.attributes.created_at },

    updated_at: { ...DataMixin.attributes.updated_at },

    _client: {
      model: 'client',
    },

    _task_s: {
      collection: 'task',
      via: '_owner',
    },

    // _managed_task_s: {
    //   collection: 'task',
    //   via: '_manager_s',
    // },
  },

  attributes_to_strip_in_validation: ['password', 'role', 'email_verified'],

  attributes_to_strip_in_json: ['password', 'role', 'email'],

  graphql_settings: {
    count: false,
    index: false,
    item: false,
  },

  async onCollectionReady(Model, nativeCollection) {
    await nativeCollection.ensureIndex({
      email: 1,
    });
    await nativeCollection.ensureIndex({
      name: 1,
    });
  },

  // customToJSON() {
  //   const record = DataMixin.customToJSON(module.exports, this);
  //   record.initials = record.name
  //     .split(/\W+/)
  //     .map((w) => w[0] || '')
  //     .join('')
  //     .toUpperCase();
  //   return record;
  // },
};

const helpers = {};

module.exports = {
  definition,
  helpers,
  collection: {},
};
