'use strict';

/* eslint-env jest */

// const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { setupWithData } = require('@/test/setup');

const Task = require('./Task.model');

describe('Task unit test with Data', () => {
  setupWithData();

  describe('Task', () => {
    test('find', async () => {
      const records = await Task.collection.find();
      expect(records).toBeInstanceOf(Array);
      expect(records.length).toBe(0);
    });
  });
});
