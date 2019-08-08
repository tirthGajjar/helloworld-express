'use strict';

/* eslint-env jest */

// const Logger = require('~/common/logger').createLogger($filepath(__filename));

const PostUtils = require('./utils');

describe('Post unit test', () => {
  describe('PostUtils', () => {
    test('slugify', async () => {
      expect(PostUtils.slugify(' TEST 1  2   3   ')).toBe('test-1-2-3');
    });
  });
});
