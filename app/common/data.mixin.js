'use strict';

const DataUtils = require('./data.utils');

const attribute = {
  created_at: {
    type: 'ref',
    autoCreatedAt: true,
  },

  updated_at: {
    type: 'ref',
    autoUpdatedAt: true,
  },

  timestamp: {
    type: 'ref',
    autoUpdatedAt: true,
  },
};

const lifecycle = {
  beforeCreate(record, next) {
    record.uid = record.uid || DataUtils.generateUniqueId();
    if (this.beforeSave) {
      this.beforeSave(record, next);
    } else {
      next();
    }
  },
  beforeUpdate(record, next) {
    if (this.beforeSave) {
      this.beforeSave(record, next);
    } else {
      next();
    }
  },
};

module.exports = {
  attribute,
  lifecycle,
};
