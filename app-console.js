'use strict';

process.env.INSTANCE_ID = process.env.INSTANCE_ID || `console-${process.env.NODE_APP_INSTANCE || '0'}`;

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

require('@/common/orm');

// open the repl session
const repl = require('repl').start({
  prompt: '~> ',
});

repl.context.fetch = global.fetch;

repl.context.uuid = require('uuid');

repl.context.Logger = Logger;

repl.context.app = require('@/common/express');

repl.context.CONFIG = require('@/common/config');
repl.context.EVENT = require('@/common/events');
repl.context.CONST = require('@/common/const');

repl.context.EVENT.once('orm-ready', (ORM) => {
  repl.context.ORM = ORM;
  Object.assign(repl.context, ORM.models);
});

repl.context.globalize = function globalize(err, result) {
  repl.context.err = err;
  repl.context.result = result;
};
