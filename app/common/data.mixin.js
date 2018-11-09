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

function customToJSON(record) {
  return Object.entries(record).reduce(
    (acc, [key, value]) => {
      if (key === 'id' || key === 'uid') {
        return acc;
      }
      if (key.startsWith('_')) {
        if (typeof value === 'object' && value) {
          return { ...acc, [key.substr(1)]: value };
        }
        return acc;
      }
      return { ...acc, [key]: value };
    },
    { id: record.uid },
  );
}

module.exports = {
  attribute,
  lifecycle,
  customToJSON,
};
