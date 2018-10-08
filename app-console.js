'use strict';

process.env.INSTANCE_ID = 'console';

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const repl = require('repl');

const EVENT = require('@/common/events');

const Data = require('@/common/data');

const context = {};

context.fetch = global.fetch;

context.Logger = Logger;

context.app = require('@/common/express');

context.CONFIG = require('@/common/config');

context.EVENT = EVENT;

context.CONST = require('@/common/const');

(async () => {
  try {
    Logger.debug('initiating ...');

    await Data.setup();

    let appConsole = null;

    context.Data = Data;

    Object.assign(context, Data.waterline.models);

    context.$globalize = (...args) => {
      appConsole.context.$outcome = args;
    };

    context.$callback = (err, result) => {
      appConsole.context.$err = err;
      appConsole.context.$result = result;
    };

    context.$promiseResult = (result) => {
      appConsole.context.$result = result;
      appConsole.context.$error = null;
    };

    context.$promiseError = (error) => {
      appConsole.context.$result = null;
      appConsole.context.$error = error;
    };

    Logger.debug('ready');

    appConsole = repl.start();

    Object.assign(appConsole.context, context);

    process.nextTick(() => EVENT.emit('console-ready'));
  } catch (error) {
    Logger.error(error);
    process.exit(1);
  }
})();

EVENT.once('shutdown', async () => {
  await Data.teardown();
});
