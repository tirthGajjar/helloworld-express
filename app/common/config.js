'use strict';

const { RELEASE_VERSION, RELEASE_DATE } = require('./release');

const INSTANCE_ID = process.env.INSTANCE_ID || '';

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
  CORE_PORT,
  API_PORT,
  API_ENDPOINT,
  MONGODB_URI,
  REDIS_URI,
  CORE_ENDPOINT,
};
