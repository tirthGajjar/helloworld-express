'use strict';

const express = require('express');
require('express-async-errors');
const express_graphql = require('express-graphql');
const morgan = require('morgan');

const Logger = require('~/common/logger').createLogger($filepath(__filename));

const CONST = require('~/common/const');

const CONFIG = require('~/common/config');

const ERROR = require('~/common/error');

const Data = require('~/common/data');

const APP_CONFIG = require('../../app-config');

const { withAuthenticatedUser, withRoleRestriction } = require('~/module/auth/auth.middleware');

class API {
  constructor() {
    this.app = null;
    this.http = null;
  }

  async setup() {
    Logger.info('initiating ...');

    const app = express();

    // enable proxy trust
    app.enable('trust proxy');

    // show stack errors
    app.set('showStackError', true);

    // enable logger (morgan)
    app.use(morgan(process.env.LOGGER_FORMAT || 'dev'));

    // enable CORS in development
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
        res.header(
          'Access-Control-Allow-Headers',
          'DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization',
        );

        if (req.method === 'OPTIONS') {
          res.sendStatus(204);
          return;
        }

        next();
      });
    }

    // delay response in development
    if (process.env.NODE_ENV === 'development') {
      app.use((req, res, next) => setTimeout(() => next(), 1000));
    }

    // handle JSON
    app.use(express.json({}));

    // secure access

    app.use('/any', withAuthenticatedUser);

    app.use('/self', withAuthenticatedUser);

    app.use('/client', withAuthenticatedUser, withRoleRestriction[CONST.ROLE.CLIENT]);

    app.use('/admin', withAuthenticatedUser, withRoleRestriction[CONST.ROLE.ADMIN]);

    // Status check
    app.get('/check', (req, res) => res.send({ status: 'ok' }));

    // load graphql
    app.use(
      '/any/graphql',
      express_graphql({
        schema: Data.Graphql.schema,
        graphiql: process.env.NODE_ENV === 'development',
      }),
    );

    // load routers
    APP_CONFIG.API_FILES.forEach((filename) => {
      Logger.info('loading', filename);
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const item = require(filename);
      app.use(item.prefix || '/', item.router);
    });

    // handle errors
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

    this.app = app;
  }

  async run() {
    this.http = this.app.listen(CONFIG.API_PORT);

    Logger.info(`ready on port ${CONFIG.API_PORT}`);
  }

  shutdown() {
    return new Promise((resolve, reject) => {
      Logger.info('shutdown ...');

      if (!this.http) {
        Logger.info('shutdown done');
        resolve();
        return;
      }

      this.http.close((err) => {
        Logger.info('shutdown done', err || '');

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

module.exports = new API();
