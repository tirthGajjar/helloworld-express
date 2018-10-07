'use strict';

/* eslint-env jest */

// const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { setupWithDAL } = require('@/test/setup');

const SamplePerson = require('@/module/sample/SamplePerson.model');

describe('Sample unit test with DAL', () => {
  describe('SamplePerson', () => {
    setupWithDAL();

    test('find', async () => {
      const persons = await SamplePerson.collection.find();
      expect(persons).toBeInstanceOf(Array);
    });
  });
});
