'use strict';

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const CONST = require('@/common/const');

const User = require('./User.model');

const AuthService = require('./auth.service');

module.exports = async () => {
  let record;

  record = await AuthService.createAdministratorAccount({
    user: {
      password: 'password',
      email: 'admin@starter.com',
      phone: '10000000',
      name: 'Starter Administrator',
      picture_uri: 'https://randomuser.me/api/portraits/lego/1.jpg',
    },
    client: {},
  });

  Logger.debug(record);

  record = await AuthService.createClientAccount({
    user: {
      password: 'password',
      email: 'client@starter.com',
      phone: '20000000',
      name: 'Starter Client',
      picture_uri: 'https://randomuser.me/api/portraits/lego/2.jpg',
    },
    client: {},
  });

  Logger.debug(record);

  for (let i = 1; i < 10; i++) {
    record = await AuthService.createAdministratorAccount({
      user: {
        password: 'password',
        email: `admin+${i}@starter.com`,
        phone: `1000000${i}`,
        name: `Starter Administrator ${i}`,
        picture_uri: `https://randomuser.me/api/portraits/lego/${i}.jpg`,
      },
      client: {},
    });

    record = await AuthService.createClientAccount({
      user: {
        password: 'password',
        email: `client+${i}@starter.com`,
        phone: `2000000${i}`,
        name: `Starter Client ${i}`,
        picture_uri: `https://randomuser.me/api/portraits/men/2${i}.jpg`,
      },
      client: {},
    });
  }
};
