'use strict';

/** @module common/data/waterline */

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const CONFIG = require('@/common/config');

const { promisify } = require('util');

const Waterline = require('waterline');
const WaterlineUtils = require('waterline-utils');
const MemoryAdapter = require('sails-disk');
const MongoAdapter = require('sails-mongo');

const DataUtils = require('./utils');

const glob = require('glob');
const path = require('path');

let ontology = null;

let models = {};

/**
 * setup
 *
 * @returns {Promise}
 */
async function setup() {
  Logger.info('setup ...');

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
          autoMigrations: {
            autoIncrement: false,
          },
        },
      },
    },
  };

  ontology = module.exports.ontology = await promisify(Waterline.start)(config);

  Object.entries(ontology.collections).forEach(([identity, collection]) => {
    if (!modelsByIdentity[identity]) {
      return;
    }
    modelsByIdentity[identity].collection = collection;
  });

  if (CONFIG.IS_CORE && process.env.MIGRATE !== 'safe') {
    Logger.info('migrate...');
    await new Promise((resolve, reject) => {
      WaterlineUtils.autoMigrations(process.env.MIGRATE, ontology, async (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(ontology);
        }
      });
    });
    Logger.info('migrate done');
  }

  if (CONFIG.IS_CORE) {
    await Promise.all(
      Object.values(models).map(async (model) => {
        if (!model.collection.onCollectionReady) {
          return;
        }
        const nativeClient = ontology.datastores.mongo.adapter.datastores.mongo.manager;
        const nativeCollection = nativeClient.collection(model.collection.tableName);
        await model.collection.onCollectionReady(model, nativeCollection);
      }),
    );
  }

  Logger.info('setup done');

  return ontology;
}

/**
 * teardown
 *
 * @returns {Promise}
 */
async function teardown() {
  return new Promise((resolve, reject) => {
    Logger.info('teardown ...');

    if (!ontology) {
      Logger.info('teardown done');
      resolve();
      return;
    }

    ontology.teardown((err) => {
      Logger.info('teardown done', err || '');

      ontology = module.exports.ontology = null;

      models = module.exports.models = {};

      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * clear
 *
 * @returns {Promise}
 */
async function clear() {
  const nativeClient = ontology.datastores.mongo.adapter.datastores.mongo.manager;
  await nativeClient.dropDatabase();
}

module.exports = {
  setup,
  teardown,
  clear,
  ontology,
  models,
};
