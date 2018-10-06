'use strict';

/* eslint-env jest */

const EVENT = require('@/common/events');

beforeAll((next) => {
  Promise.all([
    new Promise((resolve) => {
      EVENT.once('core-ready', resolve);
    }),
    new Promise((resolve) => {
      EVENT.once('api-ready', resolve);
    }),
    new Promise((resolve) => {
      EVENT.once('job-ready', resolve);
    }),
  ]).then(() => next());

  require('../../app-core');
  require('../../app-api');
  require('../../app-job');
});

afterAll(() => {
  require('@/common/events').emit('shutdown');
});
