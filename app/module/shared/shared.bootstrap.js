'use strict';

const PermanentDataStore = require('~/common/PermanentDataStore.service');

module.exports = async () => {
  await PermanentDataStore.retrieveOrStore('APP_PARAMETER', 'VALUE');
};
