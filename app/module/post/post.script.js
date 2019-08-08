'use strict';

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

process.env.INSTANCE_ID = 'script';

require('~/common/init');

const Logger = require('~/common/logger').createLogger($filepath(__filename));

const EVENT = require('~/common/events');

const Data = require('~/common/data');
const Job = require('~/common/job');

const Post = require('./Post.model');

async function setup() {
  await Data.setup();
  await Job.setup();
}

async function shutdown() {
  await Job.shutdown();
  await Data.shutdown();
}

(async () => {
  try {
    Logger.debug('initiating ...');
    await setup();
    Logger.debug('processing ...');

    const records = await Post.collection.find().where({});

    Logger.debug(records);
    Logger.debug(JSON.stringify(records, null, 2));

    Logger.debug('done');
    EVENT.emit('shutdown');
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    EVENT.emit('shutdown', 1);
  }
})();

EVENT.once('shutdown', shutdown);
