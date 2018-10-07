'use strict';

process.env.INSTANCE_ID = process.env.INSTANCE_ID || `console-${process.env.NODE_APP_INSTANCE || '0'}`;

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
    context.$outcome = args;
  };

  context.$callback = (err, result) => {
    context.$err = err;
    context.$result = result;
  };

  context.$promiseResult = (result) => {
    context.$result = result;
  };

  context.$promiseError = (error) => {
    context.$error = error;
  };

  Object.assign(repl.context, context);
});

context.fetch = global.fetch;

context.uuid = require('uuid');

context.Logger = Logger;

context.app = require('@/common/express');

context.CONFIG = require('@/common/config');

context.EVENT = EVENT;

context.CONST = require('@/common/const');
