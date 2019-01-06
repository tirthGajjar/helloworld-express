'use strict';

const DataMixin = require('@/common/data/mixin');

const TaskUtils = require('./utils');

const definition = {
  identity: 'task',

  tableName: 'Task',

  attributes: {
    title: {
      type: 'string',
      required: true,
    },

    done: {
      type: 'boolean',
      defaultsTo: false,
    },

    slug: {
      type: 'string',
    },

    created_at: { ...DataMixin.attributes.created_at },

    updated_at: { ...DataMixin.attributes.updated_at },

    _owner: {
      model: 'user',
    },

    // _manager_s: {
    //   collection: 'user',
    //   via: '_managed_task_s',
    // },
  },

  async onCollectionReady(Model, nativeCollection) {
    await nativeCollection.ensureIndex({
      title: 1,
    });
  },

  beforeSave(record, next) {
    if (record.title) {
      record.slug = TaskUtils.slugify(record.title);
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
