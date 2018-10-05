'use strict';

/* eslint-env jest */

beforeAll((next) => {
  require('@/common/events').once('ready', () => next());
  require('../../app-api');
});

afterAll(() => {
  require('@/common/events').emit('shutdown');
});
