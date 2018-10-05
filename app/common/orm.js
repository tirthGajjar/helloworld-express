'use strict';

const EVENT = require('@/common/events');

const CONFIG = require('./config');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const Waterline = require('waterline');

const MongodbAdapter = require('sails-mongo');

const glob = require('glob');
const path = require('path');

const models = {};
glob.sync('app/**/*.model.js').forEach((filename) => {
  Logger.debug('loading', filename);
  const model = require(path.resolve(filename));
  if (model.definition) {
    models[model.definition.identity] = model.definition;
  }
});

const config = {
  adapters: {
    'sails-mongo': MongodbAdapter,
  },

  datastores: {
    mongo: {
      adapter: 'sails-mongo',
      url: CONFIG.MONGODB_URL,
    },
  },

  models,

  defaultModelSettings: {
    datastore: 'mongo',
    schema: true,
    primaryKey: 'id',
    attributes: {
      id: { type: 'string', columnName: '_id' },
    },
  },
};

Waterline.start(config, (err, ORM) => {
  if (err) {
    throw err;
  }

  ORM.models = {};

  Object.entries(ORM.collections).forEach(([identity, model]) => {
    if (!models[identity]) {
      return;
    }
    models[identity].model = model;
    ORM.models[model.tableName] = model;
  });

  EVENT.emit('orm-ready', ORM);
});
