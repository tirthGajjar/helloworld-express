'use strict';

/* eslint-env jest */

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { spawn, spawnSync } = require('child_process');

const EVENT = require('@/common/events');

function setupWithDAL() {
  beforeAll((next) => {
    require('@/common/dal');
    EVENT.on('dal-ready', () => next());
  });

  afterAll((next) => {
    EVENT.emit('shutdown');
    setTimeout(() => next(), 3000);
  });
}

function setupWithRunningApp() {
  let cluster = null;

  beforeAll((next) => {
    Logger.debug('running db:clear');
    spawnSync('npm', ['run', 'db:clear'], {
      stdio: 'ignore',
    });

    Logger.debug('running db:seed');
    spawnSync('npm', ['run', 'db:seed'], {
      stdio: 'ignore',
    });

    Logger.debug('running cluster');
    cluster = spawn('pm2-runtime', ['--formatted', '--no-autorestart', 'pm2.test.json'], {
      stdio: 'ignore',
    });

    setTimeout(() => next(), 3000);
  });

  afterAll((next) => {
    cluster.kill('SIGINT');

    setTimeout(() => cluster.kill('SIGTERM'), 2000);

    setTimeout(() => next(), 3000);
  });
}

module.exports = {
  setupWithDAL,
  setupWithRunningApp,
};
