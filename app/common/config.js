'use strict';

/** @module CONFIG */

const { RELEASE_VERSION } = require('./release');

const INSTANCE_ID = process.env.INSTANCE_ID || '?';
const INSTANCE_TYPE = INSTANCE_ID.split('-')[0] || '?';
const INSTANCE_NUMBER = INSTANCE_ID.split('-')[1] || '0';

const MIGRATE = process.env.MIGRATE || 'safe';

const API_PORT = process.env.API_PORT || 5000;
const API_ENDPOINT = process.env.API_ENDPOINT || `http://localhost:${API_PORT}`;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/starter';
const REDIS_STORAGE_URI = process.env.REDIS_STORAGE_URI || 'redis://localhost:6379/0';
const REDIS_CACHE_URI = process.env.REDIS_CACHE_URI || 'redis://localhost:6379/1';
const REDIS_JOB_URI = process.env.REDIS_JOB_URI || 'redis://localhost:6379/2';

const EMAIL_TRANSPORT_URI = process.env.EMAIL_TRANSPORT_URI || 'smtp://localhost:1025';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Starter <no-reply@starter.com>';

const CLIENT_APP_URL = process.env.CLIENT_APP_URL || 'http://localhost:3000';

module.exports = {
  RELEASE_VERSION,

  INSTANCE_ID,
  INSTANCE_TYPE,
  INSTANCE_NUMBER,

  IS_CORE: INSTANCE_TYPE === 'core',
  IS_API: INSTANCE_TYPE === 'api',
  IS_JOB: INSTANCE_TYPE === 'job',
  IS_CONSOLE: INSTANCE_TYPE === 'console',
  IS_TEST: INSTANCE_TYPE === 'test',
  IS_SCRIPT: INSTANCE_TYPE === 'script',

  IS_PRIMARY: INSTANCE_TYPE === 'core' || (INSTANCE_NUMBER === '0' && INSTANCE_TYPE !== INSTANCE_ID),

  MIGRATE,

  API_PORT,
  API_ENDPOINT,

  MONGODB_URI,
  REDIS_STORAGE_URI,
  REDIS_CACHE_URI,
  REDIS_JOB_URI,

  EMAIL_TRANSPORT_URI,
  EMAIL_FROM,

  CLIENT_APP_URL,
};
