'use strict';

/* eslint-env jest */

// const Logger = require('@/common/logger').createLogger($filepath(__filename));

const SampleUtils = require('./utils');

describe('Sample unit test', () => {
  describe('utils', () => {
    test('sum', async () => {
      expect(SampleUtils.sum(1, 2)).toBe(3);
    });
  });
});
