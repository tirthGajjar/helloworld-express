'use strict';

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const CONST = require('@/common/const');

const User = require('./User.model');

const AuthService = require('./auth.service');

module.exports = async () => {
  let record;

  record = await AuthService.createAdminAccount({
    user: {
      uid: '2225b2b0-e1bb-11e8-b9e6-cd0d6397461c',
      email: 'admin@starter.com',
      phone: '10000000',
      name: 'Starter Administrator',
      password: 'password',
      picture_uri: 'https://randomuser.me/api/portraits/lego/1.jpg',
    },
    client: {},
  });

  Logger.debug(record);

  record = await AuthService.createClientAccount({
    user: {
      uid: '2074a960-e352-11e8-b257-d786ef465a4',
      email: 'admin@starter.com',
      phone: '20000000',
      name: 'Starter Client',
      password: 'password',
      picture_uri: 'https://randomuser.me/api/portraits/lego/2.jpg',
    },
    client: {},
  });

  Logger.debug(record);
};
