'use strict';

process.env.INSTANCE_ID = process.env.INSTANCE_ID || `api-${process.env.NODE_APP_INSTANCE || '0'}`;

require('@/common/init');

require('@/common/dal');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const EVENT = require('@/common/events');

const CONFIG = require('@/common/config');

// Init the express application
const app = require('@/common/express');

EVENT.once('dal-ready', (DAL) => {
  // Start the app by listening on <port>
  const http = app.listen(CONFIG.API_PORT);

  process.nextTick(() => {
    Logger.debug(`ready on port ${CONFIG.API_PORT}`);
    EVENT.emit('api-ready');
  });

  EVENT.once('shutdown', () => {
    Logger.debug('Express shutdown ...');
    http.close((err) => {
      Logger.debug('Express shutdown done.', err || '');
      if (err) {
        process.exit(1);
      }
      Logger.debug('Express shutdown done.');
      Logger.debug('Waterline teardown ...');
      DAL.waterline.teardown((err) => {
        Logger.debug('Waterline teardown done.', err || '');
        if (err) {
          process.exit(1);
        }
      });
    });
  });
});
