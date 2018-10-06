'use strict';

/* eslint-env jest */

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { spawn, spawnSync } = require('child_process');

function setup() {
  const cluster = {
    core: null,
    api: null,
    job: null,
  };

  beforeAll((next) => {
    Logger.debug('running db:clear');
    spawnSync('npm', ['run', 'db:clear'], {
      detached: true,
      stdio: 'ignore',
    });

    Logger.debug('running db:seed');
    spawnSync('npm', ['run', 'db:seed'], {
      detached: true,
      stdio: 'ignore',
    });

    Logger.debug('running app:core');
    cluster.core = spawn('node', ['./app-core.js'], {
      detached: true,
      stdio: 'inherit',
    });

    Logger.debug('running app:api');
    cluster.api = spawn('node', ['./app-api.js'], {
      detached: true,
      stdio: 'inherit',
    });

    Logger.debug('running app:job');
    cluster.job = spawn('node', ['./app-job.js'], {
      detached: true,
      stdio: 'inherit',
    });

    setTimeout(next, 3000);
  });

  afterAll((next) => {
    cluster.core.kill('SIGINT');
    cluster.api.kill('SIGINT');
    cluster.job.kill('SIGINT');

    // setTimeout(() => cluster.kill('SIGTERM'), 2000);

    setTimeout(next, 3000);
  });
}

module.exports = {
  setup,
};
