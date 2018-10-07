'use strict';

const EVENT = require('@/common/events');

const CONFIG = require('@/common/config');

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
    models[model.definition.identity] = model;
  }
});

const config = {
  adapters: {
    'sails-mongo': MongodbAdapter,
  },

  datastores: {
    mongo: {
      adapter: 'sails-mongo',
      url: CONFIG.MONGODB_URI,
    },
  },

  models: Object.entries(models).reduce((acc, [identity, model]) => ({ ...acc, [identity]: model.definition }), {}),

  defaultModelSettings: {
    datastore: 'mongo',
    schema: true,
    primaryKey: 'id',
    attributes: {
      id: { type: 'string', columnName: '_id' },
    },
  },
};

Waterline.start(config, (err, waterline) => {
  if (err) {
    throw err;
  }

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

  EVENT.emit('waterline-ready', waterline);
});

module.exports = {};
