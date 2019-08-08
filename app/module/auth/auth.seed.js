'use strict';

/* eslint-disable no-await-in-loop */

const Logger = require('~/common/logger').createLogger($filepath(__filename));

const AuthService = require('./auth.service');

module.exports = async () => {
  let record;

  record = await AuthService.createAdministratorUser({
    user: {
      password: 'password',
      email: 'admin@helloworld.emiketic.com',
      name: 'Administrator',
      picture_uri: 'https://randomuser.me/api/portraits/lego/1.jpg',
    },
    client: {},
  });

  Logger.debug(record);

  record = await AuthService.createClientUser({
    user: {
      password: 'password',
      email: 'client@helloworld.emiketic.com',
      name: 'Client',
      picture_uri: 'https://randomuser.me/api/portraits/lego/2.jpg',
    },
    client: {},
  });

  Logger.debug(record);

  for (let i = 1; i < 10; i += 1) {
    record = await AuthService.createAdministratorUser({
      user: {
        password: 'password',
        email: `admin+${i}@helloworld.emiketic.com`,
        name: `Administrator ${i}`,
      },
      client: {},
    });

    record = await AuthService.createClientUser({
      user: {
        password: 'password',
        email: `client+${i}@helloworld.emiketic.com`,
        name: `Client ${i}`,
        picture_uri: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/1${i}.jpg`,
      },
      client: {},
    });
  }
};
