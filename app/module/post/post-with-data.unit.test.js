'use strict';

/* eslint-env jest */

// const Logger = require('~/common/logger').createLogger($filepath(__filename));

const { setupWithData } = require('~/test/setup');

const Post = require('./Post.model');

describe('Post unit test with Data', () => {
  setupWithData();

  describe('Post', () => {
    test('find', async () => {
      const records = await Post.collection.find();
      expect(records).toBeInstanceOf(Array);
      expect(records.length).toBe(0);
    });
  });
});
