'use strict';

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const Task = require('./Task.model');

module.exports = async () => {
  let record;

  record = await Task.collection
    .create({
      label: 'Do something ...',
    })
    .fetch();

  Logger.debug(record);

  record = await Task.collection
    .create({
      label: 'Do something else ...',
    })
    .fetch();

  Logger.debug(record);
};
