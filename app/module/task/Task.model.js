'use strict';

const DataMixin = require('@/common/data/mixin');

const TaskUtils = require('./utils');

const definition = {
  identity: 'task',

  tableName: 'Task',

  attributes: {
    label: {
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
      collection: 'user',
    },
  },

  async onMigrate(collection) {
    await collection.ensureIndex({
      label: 1,
    });
  },

  beforeSave(record, next) {
    if (record.label) {
      record.slug = TaskUtils.slugify(record.label);
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
