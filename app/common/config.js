'use strict';

const { RELEASE_VERSION, RELEASE_DATE } = require('./release');

const INSTANCE_ID = process.env.INSTANCE_ID || '?';
const INSTANCE_TYPE = INSTANCE_ID.split('-')[0] || '?';
const INSTANCE_NUMBER = INSTANCE_ID.split('-')[1] || '0';

const MIGRATE = process.env.MIGRATE || 'safe';

const CORE_PORT = process.env.CORE_PORT || 4999;

const API_PORT = process.env.API_PORT || 5000;
const API_ENDPOINT = process.env.API_ENDPOINT || `http://localhost:${API_PORT}`;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/HelloWorld';
const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379/0';

const CORE_ENDPOINT = process.env.CORE_ENDPOINT || `http://localhost:${CORE_PORT}`;

module.exports = {
  RELEASE_VERSION,
  RELEASE_DATE,

  INSTANCE_ID,
  INSTANCE_TYPE,
  INSTANCE_NUMBER,

  IS_CORE: INSTANCE_TYPE === 'core',
  IS_API: INSTANCE_TYPE === 'api',
  IS_JOB: INSTANCE_TYPE === 'job',
  IS_CONSOLE: INSTANCE_TYPE === 'console',
  IS_SCRIPT: INSTANCE_TYPE === 'script',

  IS_PRIMARY: INSTANCE_TYPE === 'core' || (INSTANCE_NUMBER === '0' && INSTANCE_TYPE !== INSTANCE_ID),

  MIGRATE,
  CORE_PORT,
  API_PORT,
  API_ENDPOINT,
  MONGODB_URI,
  REDIS_URI,
  CORE_ENDPOINT,
};
