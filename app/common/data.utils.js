'use strict';

/** @module Data */

const uuid = require('uuid');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { spawn } = require('child_process');

function generateUniqueId() {
  return uuid.v1();
}

function generateRandomToken() {
  return uuid.v4();
}

function prepareModelDefinition(model) {
  const DataMixin = require('./data.mixin');

  const result = {
    ...model.definition,
  };

  if (result.beforeCreate) {
    const beforeCreate = result.beforeCreate;
    result.beforeCreate = function (record, next) {
      DataMixin.lifecycles.beforeCreate.call(this, record, (err) => {
        if (err) {
          next(err);
          return;
        }

        beforeCreate(record, next);
      });
    };
  } else {
    result.beforeCreate = DataMixin.lifecycles.beforeCreate;
  }

  if (result.beforeUpdate) {
    const beforeUpdate = result.beforeUpdate;
    result.beforeUpdate = function (record, next) {
      DataMixin.lifecycles.beforeUpdate.call(this, record, (err) => {
        if (err) {
          next(err);
          return;
        }

        beforeUpdate(record, next);
      });
    };
  } else {
    result.beforeUpdate = DataMixin.lifecycles.beforeUpdate;
  }

  Object.entries(result).forEach(([key, value]) => {
    if (typeof value === 'function' && key !== 'customToJSON') {
      result[key] = value.bind(result);
    }
  });

  model.definition = result;
}

function prepareModelHelpers(model) {
  const DataMixin = require('./data.mixin');

  const result = {
    validate(data, strictMode) {
      return DataMixin.validate(model, data, strictMode);
    },

    ...model.helpers,
  };

  model.helpers = result;
}

function clear() {
  return new Promise((resolve, reject) => {
    Logger.debug('running db:clear');
    spawn('npm', ['run', 'db:clear'], {
      stdio: 'ignore',
    }).on('close', (code) => (code === 0 ? resolve() : reject(new Error('db:clear failed'))));
  });
}

function seed() {
  return new Promise((resolve, reject) => {
    Logger.debug('running db:seed');
    spawn('npm', ['run', 'db:seed'], {
      stdio: 'ignore',
    }).on('close', (code) => (code === 0 ? resolve() : reject(new Error('db:seed failed'))));
  });
}

module.exports = {
  generateUniqueId,
  generateRandomToken,
  prepareModelDefinition,
  prepareModelHelpers,
  clear,
  seed,
};
