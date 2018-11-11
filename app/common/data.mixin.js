'use strict';

const DataUtils = require('./data.utils');

const attributes = {
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

const lifecycles = {
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

/**
 * converts data to JSON
 *
 * @param {*} record
 */
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

/**
 * validates and casts data
 *
 * @param {Model} Model
 * @param {object} data
 * @param {boolean} strictMode
 */

const VALIDATE_IGNORE = ['id', 'uid', 'created_at', 'updated_at'];

function validate(Model, data, strictMode = false) {
  const values = {};
  const issues = [];

  data = Object.entries(data).reduce(
    (acc, [field, value]) => (field in Model.definition.attributes ? { ...acc, [field]: value } : { ...acc }),
    {},
  );

  if (strictMode) {
    data = Object.keys(Model.definition.attributes).reduce((acc, field) => {
      if (VALIDATE_IGNORE.includes(field)) {
        return { ...acc };
      }
      return { ...acc, [field]: field in data ? data[field] : null };
    }, {});
  }

  Object.entries(data).forEach(([field, value]) => {
    try {
      values[field] = Model.collection.validate(field, value);
    } catch (err) {
      // console.log(err, JSON.stringify(err, null, 2));
      // console.log(JSON.stringify({ field, err }, null, 2));
      if (err.code === 'E_REQUIRED') {
        issues.push({
          model: Model.definition.identity,
          field,
          rule: 'required',
          message: err.message,
        });
      } else if (err.code === 'E_TYPE') {
        issues.push({
          model: Model.definition.identity,
          field,
          rule: err.expectedType,
          message: err.message,
        });
      } else {
        issues.push({
          model: Model.definition.identity,
          field,
          rule: err,
          message: err.message,
        });
      }
    }
  });
  return [values, issues];
}

module.exports = {
  attributes,
  lifecycles,
  customToJSON,
  validate,
};
