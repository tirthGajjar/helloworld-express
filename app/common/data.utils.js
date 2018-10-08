'use strict';

const uuid = require('uuid');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { spawnSync } = require('child_process');

const uniqueId = () => uuid.v1();
const randomToken = () => uuid.v4();

function clear() {
  Logger.debug('running db:clear');
  spawnSync('npm', ['run', 'db:clear'], {
    stdio: 'ignore',
  });
}

function seed() {
  Logger.debug('running db:SEED');
  spawnSync('npm', ['run', 'db:SEED'], {
    stdio: 'ignore',
  });
}

module.exports = {
  uniqueId,
  randomToken,
  clear,
  seed,
};
