'use strict';

/* eslint-env jest */

// const Logger = require('@/common/logger').createLogger($filepath(__filename));

const AuthService = require('./auth.service');

describe('Authentication', () => {
  describe('AuthService', () => {
    test('password encryption and comparison should fail with different password', async () => {
      const password = 'test';
      const encryptedPassword = await AuthService.encryptPassword(password);
      const result = await AuthService.comparePassword('wrong', encryptedPassword);
      expect(result).toBe(false);
    });

    test('password encryption and comparison should succeed with same password', async () => {
      const password = 'test';
      const encryptedPassword = await AuthService.encryptPassword(password);
      const result = await AuthService.comparePassword(password, encryptedPassword);
      expect(result).toBe(true);
    });

    test('password encryption and comparison should work with empty password', async () => {
      const password = '';
      const encryptedPassword = await AuthService.encryptPassword(password);
      const result = await AuthService.comparePassword(password, encryptedPassword);
      expect(result).toBe(true);
    });
  });

  // @TODO complete
});
