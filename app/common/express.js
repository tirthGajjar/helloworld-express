'use strict';

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const express = require('express');
require('express-async-errors');

const app = express();

module.exports = app;

// trust proxy
app.enable('trust proxy');

// Showing stack errors
app.set('showStackError', true);

// Enable logger (morgan)
app.use(require('morgan')(process.env.LOGGER_FORMAT || 'dev'));

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization,X-Scope,X-Version,X-App-Id,X-App-Version,X-App-Platform',
    );

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  });
}

app.use(express.json({}));

// Load routers

const glob = require('glob');
const path = require('path');

glob.sync('app/**/router.js').forEach((filename) => {
  Logger.debug('loading', filename);
  const router = require(path.resolve(filename));
  app.use(router.prefix, router.router);
});

// Handle errors

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

app.use((req, res) => {
  res.status(404).send({
    message: 'Not found',
  });
});
