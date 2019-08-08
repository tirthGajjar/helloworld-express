'use strict';

/** @module common/data/waterline */

const { promisify } = require('util');

const Waterline = require('waterline');
// eslint-disable-next-line import/no-extraneous-dependencies
const WaterlineUtils = require('waterline-utils');

const MemoryAdapter = require('sails-disk');
const MongoAdapter = require('sails-mongo');

const CONFIG = require('~/common/config');
const Logger = require('~/common/logger').createLogger($filepath(__filename));

const DataUtils = require('./utils');

const APP_CONFIG = require('../../../app-config');

class DataWaterline {
  constructor() {
    this.ontology = null;
    this.models = null;
  }

  /**
   * setup
   *
   * @returns {Promise}
   */
  async setup() {
    Logger.info('setup ...');

    this.models = {};

    APP_CONFIG.MODEL_FILES.forEach((filename) => {
      Logger.info('loading', filename);
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const Model = require(filename);
      if (Model.definition) {
        DataUtils.prepareModelDefinition(Model);
        DataUtils.prepareModelHelpers(Model);
        this.models[Model.definition.tableName] = Model;
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

      models: Object.values(this.models).reduce(
        (acc, Model) => ({ ...acc, [Model.definition.identity]: Model.definition }),
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

    this.ontology = await promisify(Waterline.start)(config);

    Object.values(this.ontology.collections).forEach((collection) => {
      const { manager } = this.ontology.datastores[collection.datastore].adapter.datastores[collection.datastore];

      collection.nativeManager = manager;

      collection.nativeCollection = manager.collection(collection.tableName);

      if (!this.models[collection.tableName]) {
        return;
      }

      this.models[collection.tableName].collection = collection;
    });

    if (CONFIG.IS_CORE && process.env.MIGRATE !== 'safe') {
      Logger.info('migrate...');
      await new Promise((resolve, reject) => {
        WaterlineUtils.autoMigrations(process.env.MIGRATE, this.ontology, async (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(this.ontology);
          }
        });
      });
      Logger.info('migrate done');
    }

    if (CONFIG.IS_CORE) {
      await Promise.all(
        Object.values(this.models).map(async (Model) => {
          if (!Model.collection.onReady) {
            return;
          }

          await Model.collection.onReady();
        }),
      );
    }

    Logger.info('setup done');

    return this.ontology;
  }

  /**
   * shutdown
   *
   * @returns {Promise}
   */
  shutdown() {
    return new Promise((resolve, reject) => {
      Logger.info('shutdown ...');

      if (!this.ontology) {
        Logger.info('shutdown done');
        resolve();
        return;
      }

      this.ontology.teardown((err) => {
        Logger.info('shutdown done', err || '');

        this.ontology = null;

        this.models = null;

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
  async clear() {
    const nativeClient = this.ontology.datastores.mongo.adapter.datastores.mongo.manager;
    await nativeClient.dropDatabase();
  }
}

module.exports = new DataWaterline();
