'use strict';

process.env.INSTANCE_ID = 'console';

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

require('@/common/dal');

const EVENT = require('@/common/events');

const context = {};

EVENT.once('dal-ready', (DAL) => {
  const repl = require('repl').start({
    prompt: '~> ',
  });

  context.DAL = DAL;

  Object.assign(context, DAL.waterline.models);

  context.$globalize = (...args) => {
    repl.context.$outcome = args;
  };

  context.$callback = (err, result) => {
    repl.context.$err = err;
    repl.context.$result = result;
  };

  context.$promiseResult = (result) => {
    repl.context.$result = result;
    repl.context.$error = null;
  };

  context.$promiseError = (error) => {
    repl.context.$result = null;
    repl.context.$error = error;
  };

  Object.assign(repl.context, context);
});

context.fetch = global.fetch;

context.Logger = Logger;

context.app = require('@/common/express');

context.CONFIG = require('@/common/config');

context.EVENT = EVENT;

context.CONST = require('@/common/const');
