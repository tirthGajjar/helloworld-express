'use strict';

process.env.INSTANCE_ID = process.env.INSTANCE_ID || `api-${process.env.NODE_APP_INSTANCE || '0'}`;

require('@/common/bootstrap');

require('@/common/orm');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const EVENT = require('@/common/events');

const CONFIG = require('@/common/config');

// Init the express application
const app = require('@/common/express');

EVENT.once('orm-ready', (ORM) => {
  // Start the app by listening on <port>
  const http = app.listen(CONFIG.API_PORT);

  process.nextTick(() => {
    Logger.debug('App ready.');
    EVENT.emit('ready');
  });

  EVENT.once('shutdown', () => {
    Logger.debug('Express shutdown ...');
    http.close(() => {
      Logger.debug('Express shutdown done.');
      Logger.debug('Waterline teardown ...');
      ORM.teardown((err) => {
        Logger.debug('Waterline teardown done.', err || '');
      });
    });
  });
});

// Expose app

exports.app = app;

// Logging initialization
Logger.debug(`started on port ${CONFIG.API_PORT}`);
