'use strict';

const EVENT = require('@/common/events');

const CONFIG = require('@/common/config');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const Waterline = require('waterline');
const WaterlineUtils = require('waterline-utils');
const MongoAdapter = require('sails-mongo');
const RedisAdapter = require('sails-redis');

const utils = require('./data.utils');

const glob = require('glob');
const path = require('path');

let waterline = null;
const models = {};

async function setup() {
  return new Promise((resolve, reject) => {
    Logger.debug('initiating ...');

    const modelsByIdentity = {};
    glob.sync('app/**/*.model.js').forEach((filename) => {
      Logger.debug('loading', filename);
      const model = require(path.resolve(filename));
      if (model.definition) {
        modelsByIdentity[model.definition.identity] = model;
        models[model.definition.tableName] = model;
      }
    });

    const config = {
      adapters: {
        'sails-mongo': MongoAdapter,
        'sails-redis': RedisAdapter,
      },

      datastores: {
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
          url: CONFIG.REDIS_URI,
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
            // index: true,
            // unique: true,
          },
          // createdAt: {
          //   type: 'ref',
          //   autoCreatedAt: true,
          // },
          // updatedAt: {
          //   type: 'ref',
          //   autoUpdatedAt: true,
          // },
        },
        beforeCreate(record, next) {
          record.uid = record.uid || utils.uniqueId();
          next();
        },
        customToJSON() {
          return Object.entries(this).reduce(
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
            { id: this.uid },
          );
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

        Logger.debug('ready');
      });
    });
  });
}

async function teardown() {
  return new Promise((resolve, reject) => {
    Logger.debug('teardown ...');

    if (!waterline) {
      Logger.debug('teardown done.');
      resolve();
      return;
    }

    waterline.teardown((err) => {
      Logger.debug('teardown done.', err || '');

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
