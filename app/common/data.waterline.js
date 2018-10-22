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

async function setup() {
  return new Promise((resolve, reject) => {
    Logger.debug('initiating ...');

    const models = {};
    glob.sync('app/**/*.model.js').forEach((filename) => {
      Logger.debug('loading', filename);
      const model = require(path.resolve(filename));
      if (model.definition) {
        models[model.definition.identity] = model;
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

      models: Object.entries(models).reduce((acc, [identity, model]) => ({ ...acc, [identity]: model.definition }), {}),

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
            // defaultsTo() { return utils.uniqueId(); },
            allowNull: false,
            // required: true,
            // index: true,
            // unique: true,
          },
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
        if (!models[identity]) {
          return;
        }
        models[identity].collection = collection;
      });

      waterline.models = Object.entries(models).reduce(
        (acc, [identity, model]) => ({ ...acc, [model.definition.tableName]: model }),
        {},
      );

      module.exports.waterline = waterline;

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

    if (!module.exports.waterline) {
      Logger.debug('teardown done.');
      resolve();
      return;
    }

    module.exports.waterline.teardown((err) => {
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
  waterline,
  setup,
  teardown,
};
