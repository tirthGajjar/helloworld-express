'use strict';

const MongoDataStore = require('@/common/MongoDataStore.service');

module.exports = async () => {
  await MongoDataStore.retrieveOrStore('App_PARAMETER', 'any value');
};
