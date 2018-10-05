'use strict';

const { RELEASE_VERSION, RELEASE_DATE } = require('./release');

const INSTANCE_ID = process.env.INSTANCE_ID || '';

const API_PORT = process.env.API_PORT || 5000;
const API_ENDPOINT = process.env.API_ENDPOINT || `http://localhost:${API_PORT}`;

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/HelloWorld';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

module.exports = {
  RELEASE_VERSION,
  RELEASE_DATE,
  INSTANCE_ID,
  API_PORT,
  API_ENDPOINT,
  MONGODB_URL,
  REDIS_URL,
};
