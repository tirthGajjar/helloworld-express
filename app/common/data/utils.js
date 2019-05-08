'use strict';

/** @module common/data/utils */

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { spawn } = require('child_process');

const { promisify } = require('util');

const uuidv1 = require('uuid/v1');
const uuidv4 = require('uuid/v4');

const { EventEmitter } = require('@/common/events');

const DataMixin = require('./mixin');

/**
 * generate a unique id
 *
 * @returns {UUID} - unique id (UUID v1)
 */
function generateUniqueId() {
  return uuidv1();
}

/**
 * generate a token
 *
 * @returns {UUID} - token (UUID v4)
 */
function generateToken() {
  return uuidv4();
}

/**
 * prepare and augment model definition
 *
 * @param {Model} model - model definition.
 */
function prepareModelDefinition(model) {
  const events = new EventEmitter();

  const result = {
    events,
    ...model.definition,
  };

  result.tableName = result.tableName || result.identity;

  result.dontUseObjectIds = 'dontUseObjectIds' in result ? result.dontUseObjectIds : !result.junctionTable;

  result.primaryKey = result.primaryKey || 'id';

  if (result.dontUseObjectIds && result.primaryKey === 'id') {
    result.attributes = {
      id: {
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
  } else if (!result.attributes[result.primaryKey]) {
    result.attributes = {
      [result.primaryKey]: {
        type: 'string',
        columnName: '_id',
        autoMigrations: {
          autoIncrement: false,
        },
      },
      ...result.attributes,
    };
  }

  Object.values(result.attributes).forEach((config) => {
    config.autoMigrations = config.autoMigrations || {};
  });

  if (!result.attributes_to_strip_in_validation) {
    result.attributes_to_strip_in_validation = [];
  }

  if (!result.attributes_to_strip_in_json) {
    result.attributes_to_strip_in_json = [];
  }

  if (!result.attributes_to_strip_in_graphql) {
    result.attributes_to_strip_in_graphql = [];
  }

  const {
    beforeCreate,
    afterCreate,
    beforeUpdate,
    afterUpdate,
    beforeDestroy,
    afterDestroy,
    beforeSave,
    afterSave,
  } = result;

  if (beforeCreate) {
    events.on('beforeCreate', promisify(beforeCreate.bind(result)));
  }

  if (afterCreate) {
    events.on('afterCreate', promisify(afterCreate.bind(result)));
  }

  if (beforeUpdate) {
    events.on('beforeUpdate', promisify(beforeUpdate.bind(result)));
  }

  if (afterUpdate) {
    events.on('afterUpdate', promisify(afterUpdate.bind(result)));
  }

  if (beforeDestroy) {
    events.on('beforeDestroy', promisify(beforeDestroy.bind(result)));
  }

  if (afterDestroy) {
    events.on('afterDestroy', promisify(afterDestroy.bind(result)));
  }

  if (beforeSave) {
    events.on('beforeSave', promisify(beforeSave.bind(result)));
  }

  if (afterSave) {
    events.on('afterSave', promisify(afterSave.bind(result)));
  }

  Object.assign(result, {
    beforeCreate(recordToCreate, proceed) {
      if (result.dontUseObjectIds && result.primaryKey === 'id') {
        recordToCreate.id = recordToCreate.id || generateUniqueId();
      }

      events
        .emitAsync('beforeCreate', recordToCreate)
        .then(() => events.emitAsync('beforeSave', recordToCreate))
        .then(() => proceed(), proceed);
    },
    afterCreate(newlyCreatedRecord, proceed) {
      events
        .emitAsync('afterCreate', newlyCreatedRecord)
        .then(() => events.emitAsync('afterSave', newlyCreatedRecord))
        .then(() => proceed(), proceed);
    },
    beforeUpdate(valuesToSet, proceed) {
      events
        .emitAsync('beforeUpdate', valuesToSet)
        .then(() => events.emitAsync('beforeSave', valuesToSet))
        .then(() => proceed(), proceed);
    },
    afterUpdate(updatedRecord, proceed) {
      events
        .emitAsync('afterUpdate', updatedRecord)
        .then(() => events.emitAsync('afterSave', updatedRecord))
        .then(() => proceed(), proceed);
    },
    beforeDestroy(criteria, proceed) {
      events.emitAsync('beforeDestroy', criteria).then(() => proceed(), proceed);
    },
    afterDestroy(destroyedRecord, proceed) {
      events.emitAsync('afterDestroy', destroyedRecord).then(() => proceed(), proceed);
    },
  });

  if (!result.customToJSON) {
    result.customToJSON = function () {
      return DataMixin.customToJSON(model, this);
    };
  }

  result.association = DataMixin.association;

  result.lookupByAssociationWithId = DataMixin.lookupByAssociationWithId;

  model.definition = result;
}

/**
 * prepare and augment model helpers
 *
 * @param {Model} model - model definition.
 */
function prepareModelHelpers(model) {
  const result = {
    validate(data, strictMode) {
      return DataMixin.validate(model, data, strictMode);
    },

    ...model.helpers,
  };

  model.helpers = result;
}

/**
 * clear out data stores
 *
 * @returns {Promise}
 */
function clear() {
  return new Promise((resolve, reject) => {
    Logger.debug('running db:clear');
    spawn('npm', ['run', 'db:clear'], {
      stdio: 'ignore',
    }).on('close', (code) => (code === 0 ? resolve() : reject(new Error('db:clear failed'))));
  });
}

/**
 * seed data stores
 *
 * @returns {Promise}
 */
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
  generateToken,
  prepareModelDefinition,
  prepareModelHelpers,
  clear,
  seed,
};
