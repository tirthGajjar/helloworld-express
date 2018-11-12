'use strict';

/** @module DataWaterline */

const EVENT = require('@/common/events');

const CONFIG = require('@/common/config');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const Waterline = require('waterline');
const WaterlineUtils = require('waterline-utils');
const MemoryAdapter = require('sails-disk');
const MongoAdapter = require('sails-mongo');
const RedisAdapter = require('sails-redis');

const DataUtils = require('./data.utils');
const DataMixin = require('./data.mixin');

const glob = require('glob');
const path = require('path');

let waterline = null;

const models = {};

async function setup() {
  return new Promise((resolve, reject) => {
    Logger.info('initiating ...');

    const modelsByIdentity = {};
    glob.sync('app/**/*.model.js').forEach((filename) => {
      Logger.info('loading', filename);
      const model = require(path.resolve(filename));
      if (model.definition) {
        DataUtils.prepareModelDefinition(model);
        DataUtils.prepareModelHelpers(model);
        modelsByIdentity[model.definition.identity] = model;
        models[model.definition.tableName] = model;
      }
    });

    const config = {
      adapters: {
        'sails-disk': MemoryAdapter,
        'sails-mongo': MongoAdapter,
        'sails-redis': RedisAdapter,
      },

      datastores: {
        memory: {
          adapter: 'sails-disk',
          inMemoryOnly: true,
        },
        mongo: {
          adapter: 'sails-mongo',
          url: CONFIG.MONGODB_URI,
        },
        // 'mongo-secondary': {
        //   adapter: 'sails-mongo',
        //   url: CONFIG.MONGODB_SECONDARY_URI,
        // },
        redis: {
          adapter: 'sails-redis',
          url: CONFIG.REDIS_STORAGE_URI,
        },
        // 'redis-cache': {
        //   adapter: 'sails-redis',
        //   url: CONFIG.REDIS_CACHE_URI,
        // },
      },

      models: Object.entries(modelsByIdentity).reduce(
        (acc, [identity, model]) => ({ ...acc, [identity]: model.definition }),
        {},
      ),

      defaultModelSettings: {
        datastore: 'mongo',
        migrate: process.env.MIGRATE,
        schema: true,
        primaryKey: 'id',
        attributes: {
          id: {
            type: 'string',
            columnName: '_id',
            autoMigrations: {},
          },
          uid: {
            type: 'string',
            allowNull: false,
            validations: {
              isUUID: true,
            },
            // index: true,
            // unique: true,
          },
        },
        customToJSON() {
          return DataMixin.customToJSON(this);
        },
      },
    };

    Waterline.start(config, (err, ontology) => {
      if (err) {
        reject(err);
        return;
      }

      waterline = ontology;

      Object.entries(waterline.collections).forEach(([identity, collection]) => {
        if (!modelsByIdentity[identity]) {
          return;
        }
        modelsByIdentity[identity].collection = collection;
      });

      module.exports.waterline = waterline;

      module.exports.models = models;

      WaterlineUtils.autoMigrations(process.env.MIGRATE, waterline, (err) => {
        if (err) {
          reject(err);
          return;
        }

        process.nextTick(() => EVENT.emit('waterline-ready', waterline));

        resolve(waterline);

        Logger.info('ready');
      });
    });
  });
}

async function teardown() {
  return new Promise((resolve, reject) => {
    Logger.info('teardown ...');

    if (!waterline) {
      Logger.info('teardown done.');
      resolve();
      return;
    }

    waterline.teardown((err) => {
      Logger.info('teardown done.', err || '');

      waterline = null;

      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

module.exports = {
  setup,
  teardown,
  waterline,
  models,
};
