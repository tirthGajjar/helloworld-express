'use strict';

const graphql = require('graphql');

const CONST = require('~/common/const');

const DataMixin = require('~/common/data/mixin');

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

    _post_s: {
      collection: 'post',
      via: '_owner',
    },

    // _managed_post_s: {
    //   collection: 'post',
    //   via: '_manager_s',
    // },
  },

  attributes_ignored_in_input: ['password', 'role', 'email_verified'],

  attributes_ignored_in_output: ['password', 'role', 'email', 'email_verified'],

  graphql_settings: {
    count: false,
    index: false,
    item: false,
    custom_types(collection) {
      return {
        UserRecord: new graphql.GraphQLObjectType({
          name: 'UserRecord',
          fields: () => ({
            ...collection.graphql.fields,
            role: { type: graphql.GraphQLString },
            email: { type: graphql.GraphQLString },
            email_verified: { type: graphql.GraphQLBoolean },
            phone: { type: graphql.GraphQLString },
            phone_verified: { type: graphql.GraphQLBoolean },
            passcode: { type: graphql.GraphQLBoolean },
          }),
        }),
      };
    },
  },

  async onReady() {
    await this.nativeCollection.ensureIndex({
      email: 1,
    });
    await this.nativeCollection.ensureIndex({
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

  toUserRecord(user) {
    return {
      role: user.role,
      email: user.email,
      email_verified: user.email_verified,
      ...user.toJSON(),
    };
  },
};

const helpers = {};

module.exports = {
  definition,
  helpers,
  collection: {},
};
