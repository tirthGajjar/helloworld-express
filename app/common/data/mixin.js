'use strict';

const uuidv1 = require('uuid/v1');

/** @module Data */

function generateUniqueId() {
  return uuidv1();
}

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
    record.uid = record.uid || generateUniqueId();
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
function customToJSON(Modal, record) {
  return Object.entries(record).reduce(
    (acc, [key, value]) => {
      if (key === 'id' || key === 'uid') {
        return acc;
      }
      if (Modal.definition.attributes_to_strip_in_json.includes(key)) {
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

function validate(Model, data, strictMode = false) {
  const values = {};
  const issues = [];

  data = Object.entries(data).reduce(
    (acc, [field, value]) => (field in Model.definition.attributes ? { ...acc, [field]: value } : { ...acc }),
    {},
  );

  if (strictMode) {
    data = Object.entries(Model.definition.attributes).reduce((acc, [field, fieldConfig]) => {
      const result = { ...acc };
      if (field in data) {
        result[field] = data[field];
      } else if (fieldConfig.required) {
        result[field] = null;
      }
      // } else if (fieldConfig.defaultsTo) {
      //   result[field] = fieldConfig.defaultsTo;
      // }
      return result;
    }, {});
  }

  data = Object.entries(data).reduce(
    (acc, [field, value]) => (Model.definition.attributes_to_strip_in_validation.includes(field) ? { ...acc } : { ...acc, [field]: value }),
    {},
  );

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
