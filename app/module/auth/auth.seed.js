'use strict';

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const AuthService = require('./auth.service');

module.exports = async () => {
  let record;

  record = await AuthService.createAdministratorAccount({
    user: {
      password: 'password',
      email: 'admin@starter.com',
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
        name: `Starter Administrator ${i}`,
      },
      client: {},
    });

    record = await AuthService.createClientAccount({
      user: {
        password: 'password',
        email: `client+${i}@starter.com`,
        name: `Starter Client ${i}`,
        picture_uri: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/1${i}.jpg`,
      },
      client: {},
    });
  }
};
