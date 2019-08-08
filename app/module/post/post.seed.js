'use strict';

const Logger = require('~/common/logger').createLogger($filepath(__filename));

const CONST = require('~/common/const');

const User = require('../auth/User.model');
const Post = require('./Post.model');

const SharedUtils = require('~/shared/utils');

module.exports = async () => {
  const DATA = {};

  DATA.User = await User.collection.find().where({
    role: CONST.ROLE.CLIENT,
  });

  let record;

  record = await Post.collection
    .create({
      title: 'Title #1',
      body: '...',
      // _owner: SharedUtils.getRandomArrayItem(DATA.User).id,
      _owner: DATA.User[0].id,
      // _manager_s: SharedUtils.getRandomArrayItemSet(DATA.User).map((item) => item.id),
    })
    .fetch();

  Logger.debug(record);

  record = await Post.collection
    .create({
      title: 'Title #2',
      body: '...',
      // _owner: SharedUtils.getRandomArrayItem(DATA.User).id,
      _owner: DATA.User[0].id,
      // _manager_s: SharedUtils.getRandomArrayItemSet(DATA.User).map((item) => item.id),
    })
    .fetch();

  Logger.debug(record);
};
