'use strict';

/* eslint-env jest */

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { spawn } = require('child_process');

const Data = require('@/common/data');
const DataUtils = require('@/common/data.utils');

function setupWithData(mode) {
  beforeAll(async () => {
    if (mode === 'seed') {
      DataUtils.seed();
    } else {
      DataUtils.clear();
    }
    await Data.setup();
  });

  afterAll(async (next) => {
    await Data.teardown();
    setTimeout(() => next(), 3000);
  });
}

const TEST_CLUSTER_TIMEOUT = (process.env.TEST_CLUSTER_TIMEOUT && Number(process.env.TEST_CLUSTER_TIMEOUT)) || 3000;

function setupWithRunningApp(mode) {
  let cluster = null;

  beforeAll((next) => {
    jest.setTimeout(30000);

    if (mode === 'seed') {
      DataUtils.seed();
    } else {
      DataUtils.clear();
    }

    Logger.debug('running cluster');
    cluster = spawn('pm2-runtime', ['--formatted', '--no-autorestart', 'pm2.test.json'], {
      stdio: 'ignore',
    });

    setTimeout(() => next(), TEST_CLUSTER_TIMEOUT);
  });

  afterAll((next) => {
    cluster.kill('SIGINT');
    setTimeout(() => cluster.kill('SIGTERM'), 2000);
    cluster.on('exit', () => next());
  });
}

module.exports = {
  setupWithData,
  setupWithRunningApp,
};
