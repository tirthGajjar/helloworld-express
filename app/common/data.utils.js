'use strict';

const uuid = require('uuid');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { spawnSync } = require('child_process');

function generateUniqueId() {
  return uuid.v1();
}

function generateRandomToken() {
  return uuid.v4();
}

function prepareModelDefinition(definition) {
  const DataMixin = require('./data.mixin');

  const result = {
    ...definition,
  };

  if (result.beforeCreate) {
    const beforeCreate = result.beforeCreate;
    result.beforeCreate = function (record, next) {
      DataMixin.lifecycle.beforeCreate.call(this, record, (err) => {
        if (err) {
          next(err);
          return;
        }

        beforeCreate(record, next);
      });
    };
  } else {
    result.beforeCreate = DataMixin.lifecycle.beforeCreate;
  }

  if (result.beforeUpdate) {
    const beforeUpdate = result.beforeUpdate;
    result.beforeUpdate = function (record, next) {
      DataMixin.lifecycle.beforeUpdate.call(this, record, (err) => {
        if (err) {
          next(err);
          return;
        }

        beforeUpdate(record, next);
      });
    };
  } else {
    result.beforeUpdate = DataMixin.lifecycle.beforeUpdate;
  }

  Object.entries(result).forEach(([key, value]) => {
    if (typeof value === 'function' && key !== 'customToJSON') {
      result[key] = value.bind(result);
    }
  });

  return result;
}

function sanitize(model, data, mode = 'edit') {
  const result = {};
  if (mode === 'create') {
    Object.keys(model.definition.attributes).forEach((field) => {
      if (field === 'id' || field === 'uid') {
        return;
      }
      result[field] = typeof data[field] !== 'undefined' ? data[field] : null;
    });
  } else {
    Object.entries(data).forEach(([field, value]) => {
      if (field in model.definition.attributes && field !== 'id' && field !== 'uid') {
        result[field] = value;
      }
    });
  }
  return result;
}

function validate(model, data) {
  const result = [];
  Object.entries(data).forEach(([field, value]) => {
    try {
      // model.collection.validate(field, typeof value === 'undefined' ? null : value);
      model.collection.validate(field, value);
    } catch (err) {
      // console.log(err, JSON.stringify(err, null, 2));
      // console.log(JSON.stringify({ field, err }, null, 2));
      if (err.code === 'E_REQUIRED') {
        result.push({
          field,
          issue: 'required',
          message: err.message,
        });
      } else if (err.code === 'E_TYPE') {
        result.push({
          field,
          issue: err.expectedType,
          message: err.message,
        });
      } else {
        result.push({
          field,
          issue: err,
          message: err.message,
        });
      }
    }
  });
  return result;
}

function clear() {
  Logger.debug('running db:clear');
  spawnSync('npm', ['run', 'db:clear'], {
    stdio: 'ignore',
  });
}

function seed() {
  Logger.debug('running db:seed');
  spawnSync('npm', ['run', 'db:seed'], {
    stdio: 'ignore',
  });
}

module.exports = {
  generateUniqueId,
  generateRandomToken,
  prepareModelDefinition,
  sanitize,
  validate,
  clear,
  seed,
};
