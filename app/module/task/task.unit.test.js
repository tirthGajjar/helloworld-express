'use strict';

/* eslint-env jest */

// const Logger = require('@/common/logger').createLogger($filepath(__filename));

const TaskUtils = require('./utils');

describe('Task unit test', () => {
  describe('TaskUtils', () => {
    test('slugify', async () => {
      expect(TaskUtils.slugify(' TEST 1  2   3   ')).toBe('test-1-2-3');
    });
  });
});
