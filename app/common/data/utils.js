'use strict';

/** @module Data */

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { spawn } = require('child_process');

const DataMixin = require('./mixin');

function prepareModelDefinition(model) {
  const result = {
    ...model.definition,
  };

  result.tableName = result.tableName || result.identity;

  if (result.beforeCreate) {
    const beforeCreate = result.beforeCreate;

    result.beforeCreate = (record, next) => {
      DataMixin.lifecycles.beforeCreate.call(result, record, (err) => {
        if (err) {
          next(err);
        } else {
          beforeCreate(record, next);
        }
      });
    };
  } else {
    result.beforeCreate = DataMixin.lifecycles.beforeCreate.bind(result);
  }

  if (result.beforeUpdate) {
    const beforeUpdate = result.beforeUpdate;

    result.beforeUpdate = (record, next) => {
      DataMixin.lifecycles.beforeUpdate.call(result, record, (err) => {
        if (err) {
          next(err);
        } else {
          beforeUpdate(record, next);
        }
      });
    };
  } else {
    result.beforeUpdate = DataMixin.lifecycles.beforeUpdate.bind(result);
  }

  if (!result.customToJSON) {
    result.customToJSON = function () {
      return DataMixin.customToJSON(model, this);
    };
  }

  result.attributes = {
    ...(!model.primaryKey && !result.attributes.id
      ? {
        id: {
          type: 'string',
          columnName: '_id',
          autoMigrations: {},
        },
        ...result.attributes,
      }
      : {}),
    uid: {
      type: 'string',
      allowNull: false,
      validations: {
        isUUID: true,
      },
      autoMigrations: {
        columnType: 'string',
        unique: true,
        autoIncrement: false,
      },
    },
    ...result.attributes,
  };

  if (!result.attributes_to_strip_in_validation) {
    result.attributes_to_strip_in_validation = [];
  }

  if (!result.attributes_to_strip_in_json) {
    result.attributes_to_strip_in_json = [];
  }

  model.definition = result;
}

function prepareModelHelpers(model) {
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
  prepareModelDefinition,
  prepareModelHelpers,
  clear,
  seed,
};
