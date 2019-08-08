'use strict';

const DataMixin = require('~/common/data/mixin');

const PostUtils = require('./utils');

const definition = {
  identity: 'post',

  tableName: 'Post',

  attributes: {
    slug: {
      type: 'string',
    },

    title: {
      type: 'string',
      required: true,
    },

    body: {
      type: 'string',
      required: true,
    },

    created_at: { ...DataMixin.attributes.created_at },

    updated_at: { ...DataMixin.attributes.updated_at },

    _owner: {
      model: 'user',
    },

    // _manager_s: {
    //   collection: 'user',
    //   via: '_managed_post_s',
    // },
  },

  // graphql_settings: {
  //   count: false,
  //   index: false,
  //   item: false,
  // },

  async onReady() {
    await this.nativeCollection.ensureIndex({
      title: 1,
    });
  },

  beforeSave(record, next) {
    if (record.title) {
      record.slug = PostUtils.slugify(record.title);
    }
    next();
  },
};

const helpers = {};

module.exports = {
  definition,
  helpers,
  collection: {},
};
