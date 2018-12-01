'use strict';

/** @module Data */

const CONFIG = require('@/common/config');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { promisify } = require('util');

const Waterline = require('waterline');
const WaterlineUtils = require('waterline-utils');
const MemoryAdapter = require('sails-disk');
const MongoAdapter = require('sails-mongo');

const DataUtils = require('./utils');
const DataMixin = require('./mixin');

const glob = require('glob');
const path = require('path');

let ontology = null;

const models = {};

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

  ontology = await promisify(Waterline.start)(config);

  Object.entries(ontology.collections).forEach(([identity, collection]) => {
    if (!modelsByIdentity[identity]) {
      return;
    }
    modelsByIdentity[identity].collection = collection;
  });

  module.exports.ontology = ontology;

  module.exports.models = models;

  if (CONFIG.IS_CORE && process.env.MIGRATE !== 'safe') {
    await new Promise((resolve, reject) => {
      WaterlineUtils.autoMigrations(process.env.MIGRATE, ontology, async (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(ontology);
        }
      });
    });

    await Promise.all(
      Object.values(models).map(async (model) => {
        if (!model.collection.onBeforeReady) {
          return;
        }
        const nativeClient = ontology.datastores.mongo.adapter.datastores.mongo.manager;
        const nativeCollection = nativeClient.collection(model.collection.tableName);
        await model.collection.onBeforeReady(model, nativeCollection);
      }),
    );
  }

  Logger.info('setup done');

  return ontology;
}

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

      ontology = null;

      module.exports.ontology = null;

      ontology = models;

      module.exports.models = null;

      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

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
