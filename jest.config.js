'use strict';

module.exports = {
  testMatch: ['<rootDir>/app/**/*.test.js'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  bail: true,
  verbose: true,
  testURL: 'http://localhost/',
};
