'use strict';

/* eslint-disable no-invalid-this */

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
    if (this.dontUseObjectIds && this.primaryKey === 'id') {
      record.id = record.id || generateUniqueId();
    }
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
      if (key === 'id' || key === '_id') {
        return acc;
      }
      if (Modal.definition.attributes_to_strip_in_json.includes(key)) {
        return acc;
      }
      // if (key.startsWith('_')) {
      //   if (typeof value === 'object' && value) {
      //     return { ...acc, [key.substr(1)]: value };
      //   }
      //   return acc;
      // }
      return { ...acc, [key]: value };
    },
    { id: record.id },
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

/**
 * retrieve association collections
 *
 * @param {object} collection
 * @param {string} field
 */
function association(field) {
  const collection = this;
  const collections = collection.waterline.collections;
  const config = collection.attributes[field];

  if (!config.collection) {
    throw new Error('invalid operation: field is not an association');
  }

  const targetCollection = collections[config.collection];

  const throughCollection = collections[config.through]
    || collections[`${collection.identity}_${field}__${config.collection}_${config.via}`]
    || collections[`${config.collection}_${config.via}__${collection.identity}_${field}`];

  const attributes = {};

  if (throughCollection) {
    const attributeByModel = Object.entries(throughCollection.attributes).reduce(
      (acc, [attribute, config]) => ({ ...acc, [config.model || attribute]: attribute }),
      {},
    );
    attributes.self = attributeByModel[collection.identity];
    attributes.target = attributeByModel[targetCollection.identity];
  } else {
    const attributeByModel = Object.entries(targetCollection.attributes).reduce(
      (acc, [attribute, config]) => ({ ...acc, [config.model || attribute]: attribute }),
      {},
    );
    attributes.self = attributeByModel[collection.identity];
  }

  return [targetCollection, throughCollection, attributes];
}

async function lookupByAssociationWithId(field, criterion) {
  const [_, throughCollection, attributes] = this.association(field);

  const records = await throughCollection
    .find()
    .where({ [attributes.target]: criterion })
    .select([attributes.self]);

  const ids = records.map((item) => item[attributes.self]);

  return ids;
}

module.exports = {
  attributes,
  lifecycles,
  customToJSON,
  validate,
  association,
  lookupByAssociationWithId,
};
