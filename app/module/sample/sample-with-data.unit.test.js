'use strict';

/* eslint-env jest */

// const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { setupWithData } = require('@/test/setup');

const SamplePerson = require('./SamplePerson.model');
const SamplePet = require('./SamplePet.model');

describe('Sample unit test with Data', () => {
  setupWithData();

  describe('SamplePerson', () => {
    test('find', async () => {
      const persons = await SamplePerson.collection.find();
      expect(persons).toBeInstanceOf(Array);
      expect(persons.length).toBe(0);
    });
  });

  describe('SamplePet', () => {
    test('find', async () => {
      const persons = await SamplePet.collection.find();
      expect(persons).toBeInstanceOf(Array);
      expect(persons.length).toBe(0);
    });
  });
});
