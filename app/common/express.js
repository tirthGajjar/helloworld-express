'use strict';

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const express = require('express');
require('express-async-errors');
const express_graphql = require('express-graphql');

const path = require('path');

const CONST = require('@/common/const');

const CONFIG = require('@/common/config');

const ERROR = require('@/common/error');

const Data = require('@/common/data');

const APP_CONFIG = require('../../app-config');

const { withAuthenticatedUser, withRoleRestriction } = require('@/module/auth/auth.middleware');

class Express {
  constructor() {
    this.app = null;
    this.http = null;
  }

  async setup() {
    Logger.info('initiating ...');

    const app = express();

    // Enable proxy trust
    app.enable('trust proxy');

    // Showing stack errors
    app.set('showStackError', true);

    // Enable logger (morgan)
    app.use(require('morgan')(process.env.LOGGER_FORMAT || 'dev'));

    // Enable CORS in development
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
        res.header(
          'Access-Control-Allow-Headers',
          'DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization',
        );

        if (req.method === 'OPTIONS') {
          return res.sendStatus(204);
        }

        next();
      });
    }

    // Delay response in development
    if (process.env.NODE_ENV === 'development') {
      app.use((req, res, next) => setTimeout(() => next(), 1000));
    }

    // Handle JSON
    app.use(express.json({}));

    // Secure access

    app.use('/any', withAuthenticatedUser);

    app.use('/self', withAuthenticatedUser);

    app.use('/client', withAuthenticatedUser, withRoleRestriction[CONST.ROLE.CLIENT]);

    app.use('/admin', withAuthenticatedUser, withRoleRestriction[CONST.ROLE.ADMIN]);

    // Status check
    app.get('/check', (req, res) => res.send({ status: 'ok' }));

    // Load graphql
    app.use(
      '/any/graphql',
      express_graphql({
        schema: Data.Graphql.schema,
        graphiql: process.env.NODE_ENV === 'development',
      }),
    );

    // Load routers
    APP_CONFIG.API_FILES.forEach((filename) => {
      Logger.info('loading', filename);
      const item = require(path.resolve(filename));
      app.use(item.prefix || '/', item.router);
    });

    // Handle errors
    app.use((err, req, res, next) => {
      console.error(err);

      if (err.name === 'UsageError') {
        err = ERROR.InvalidRequestError.fromWaterlineError(err);
      }

      res.status(err.status || 500).json({
        code: err.code || 'Unknown',
        message: err.message || 'Unknown error',
        extra: err.extra || undefined,
      });
    });

    app.use((req, res) => {
      res.status(404).send({
        code: 'NotFound',
        message: 'API not found',
      });
    });

    const http = app.listen(CONFIG.API_PORT);

    this.app = app;
    this.http = http;

    Logger.info(`ready on port ${CONFIG.API_PORT}`);
  }

  teardown() {
    return new Promise((resolve, reject) => {
      Logger.info('teardown ...');

      if (!this.http) {
        Logger.info('teardown done');
        resolve();
        return;
      }

      this.http.close((err) => {
        Logger.info('teardown done', err || '');

        this.app = null;
        this.http = null;

        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new Express();
