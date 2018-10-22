'use strict';

/* eslint-env jest */

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { spawn } = require('child_process');

const Data = require('@/common/data');

function setupWithData() {
  beforeAll(async () => {
    Data.utils.clear();
    await Data.setup();
  });

  afterAll(async (next) => {
    await Data.teardown();
    setTimeout(() => next(), 3000);
  });
}

function setupWithRunningApp() {
  let cluster = null;

  beforeAll((next) => {
    Data.utils.seed();

    Logger.debug('running cluster');
    cluster = spawn('pm2-runtime', ['--formatted', '--no-autorestart', 'pm2.test.json'], {
      stdio: 'inherit',
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
  setupWithData,
  setupWithRunningApp,
};
