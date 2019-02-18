'use strict';

const { EventEmitter } = require('starter-lib/dist/common/events');

const EVENT = new EventEmitter();

EVENT.EventEmitter = EventEmitter;

module.exports = EVENT;
