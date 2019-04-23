'use strict';

process.env.INSTANCE_ID = 'console';

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const repl = require('repl');

const EVENT = require('@/common/events');

const Data = require('@/common/data');
const Job = require('@/common/job');

const context = {};

context.fetch = global.fetch;

context.Logger = Logger;

context.app = require('@/common/express');

context.CONFIG = require('@/common/config');

context.EVENT = EVENT;

context.CONST = require('@/common/const');

context.ERROR = require('@/common/error');

context.VALIDATE = require('@/common/validate');

context.SANITIZE = require('@/common/sanitize');

context.Data = Data;

context.DataUtils = require('@/common/data/utils');

context.PermanentDataStore = require('@/common/PermanentDataStore.service');

context.TransientDataStore = require('@/common/TransientDataStore.service');

async function setup() {
  await Data.setup();
  await Job.setup();
}

async function teardown() {
  await Job.teardown();
  await Data.teardown();
}

(async () => {
  try {
    Logger.info('initiating ...');
    await setup();

    let appConsole = null;

    Object.assign(context, Data.waterline.models);

    context.Job = Job;

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

    Logger.info('ready');

    appConsole = repl.start();

    Object.assign(appConsole.context, context);

    process.nextTick(() => EVENT.emit('console-ready'));
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    EVENT.emit('shutdown', 1);
  }
})();

EVENT.once('shutdown', teardown);
