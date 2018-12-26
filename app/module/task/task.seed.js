'use strict';

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const User = require('../auth/User.model');
const Task = require('./Task.model');

const SharedUtils = require('@/shared/utils');

module.exports = async () => {
  const DATA = {};

  DATA.User = await User.collection.find();

  let record;

  record = await Task.collection
    .create({
      title: 'Do something ...',
      _owner: SharedUtils.getRandomArrayItem(DATA.User).id,
      // _manager_s: SharedUtils.getRandomArrayItemSet(DATA.User).map((item) => item.id),
    })
    .fetch();

  Logger.debug(record);

  record = await Task.collection
    .create({
      title: 'Do something else ...',
      _owner: SharedUtils.getRandomArrayItem(DATA.User).id,
      // _manager_s: SharedUtils.getRandomArrayItemSet(DATA.User).map((item) => item.id),
    })
    .fetch();

  Logger.debug(record);
};
