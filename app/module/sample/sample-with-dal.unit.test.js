'use strict';

/* eslint-env jest */

// const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { setupWithDAL } = require('@/test/setup');

const SampleUser = require('@/module/sample/SampleUser.model');

describe('Sample unit test with DAL', () => {
  describe('SampleUser', () => {
    setupWithDAL();

    test('find', async () => {
      const users = await SampleUser.collection.find();

      console.log(users);

      expect(users).toBeInstanceOf(Array);
    });
  });
});
