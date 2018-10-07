'use strict';

const { EventEmitter } = require('emiketic-starter-lib/dist/common/events');

const EVENT = new EventEmitter();

EVENT.EventEmitter = EventEmitter;

EVENT.toPromise = (event) => new Promise((resolve) => EVENT.once(event, resolve));

module.exports = EVENT;
