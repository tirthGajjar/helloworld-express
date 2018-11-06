'use strict';

const uuid = require('uuid');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { spawnSync } = require('child_process');

const DataMixin = require('./data.mixin');

function generateUniqueId() {
  return uuid.v1();
}

function generateTandomToken() {
  return uuid.v4();
}

function prepareModelDefinition(definition) {
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
    if (typeof value === 'function') {
      result[key] = value.bind(result);
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
  Logger.debug('running db:SEED');
  spawnSync('npm', ['run', 'db:SEED'], {
    stdio: 'ignore',
  });
}

module.exports = {
  generateUniqueId,
  generateTandomToken,
  prepareModelDefinition,
  clear,
  seed,
};
