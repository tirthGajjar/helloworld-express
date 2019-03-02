'use strict';

/* eslint-env jest */

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { spawn } = require('child_process');

const CONFIG = require('@/common/config');

const Data = require('@/common/data');
const DataUtils = require('@/common/data/utils');

function setupWithData(mode) {
  beforeAll(async () => {
    jest.setTimeout(10000);

    if (mode === 'seed') {
      await DataUtils.seed();
    } else {
      await DataUtils.clear();
    }

    await Data.setup();
  });

  afterAll(async (next) => {
    await Data.teardown();
    next();
  });
}

function setupWithRunningApp(mode) {
  let app = null;

  beforeAll(async (next) => {
    jest.setTimeout(30000);

    if (mode === 'seed') {
      await DataUtils.seed();
    } else {
      await DataUtils.clear();
    }

    await Data.setup();

    Logger.debug('running app');
    app = spawn('pm2-runtime', ['--formatted', '--no-autorestart', 'pm2.test.json']);

    let started = false;

    app.stdout.on('data', (data) => {
      if (!started && data.toString().includes(`ready on port ${CONFIG.API_PORT}`)) {
        started = true;
        setTimeout(() => next(), 1000);
      }
    });
  });

  beforeEach((next) => {
    setTimeout(() => next(), 1000);
  });

  afterAll(async (next) => {
    await Data.teardown();
    app.on('exit', () => next());
    app.kill('SIGINT');
  });
}

module.exports = {
  setupWithData,
  setupWithRunningApp,
};
