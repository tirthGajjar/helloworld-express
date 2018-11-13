'use strict';

/* eslint-env jest */

// const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { setupWithData } = require('@/test/setup');

const CONST = require('@/common/const');

const AuthService = require('./auth.service');

describe('Authentication', () => {
  describe('password encryption and comparison', () => {
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

  describe('access token generation and validation', () => {
    test('access token generation and validation should succeed with client', async () => {
      const user = {
        uid: 'd90ed360-e744-11e8-b4de-0d7fd38ce0e5',
      };
      const access_token = await AuthService.generateAccessToken(user);
      const result = await AuthService.validateAccessToken(access_token);
      expect(result.aud).toBe(CONST.ROLE.CLIENT);
      expect(result.id).toBe(user.uid);
    });
    test('access token generation and validation should succeed with admin', async () => {
      const user = {
        uid: 'd90ed360-e744-11e8-b4de-0d7fd38ce0e5',
      };
      const access_token = await AuthService.generateAccessToken(user, CONST.ROLE.ADMIN);
      const result = await AuthService.validateAccessToken(access_token);
      expect(result.aud).toBe(CONST.ROLE.ADMIN);
      expect(result.id).toBe(user.uid);
    });
  });

  describe('access token extraction', () => {
    test('access token extraction should fail with authorization header', async () => {
      const user = {
        uid: 'd90ed360-e744-11e8-b4de-0d7fd38ce0e5',
      };
      let access_token = await AuthService.generateAccessToken(user);
      const req = {
        headers: {
          authorization: access_token,
        },
        query: {},
      };
      access_token = AuthService.extractAccessTokenFromRequest(req);
      expect(access_token).toBe('');
    });

    test('access token extraction should succeed with `Bearer` authorization header', async () => {
      const user = {
        uid: 'd90ed360-e744-11e8-b4de-0d7fd38ce0e5',
      };
      let access_token = await AuthService.generateAccessToken(user);
      const req = {
        headers: {
          authorization: `Bearer ${access_token}`,
        },
        query: {},
      };
      access_token = AuthService.extractAccessTokenFromRequest(req);
      const result = await AuthService.validateAccessToken(access_token);
      expect(result.id).toBe(user.uid);
    });

    test('access token extraction should succeed with `JWT` authorization header', async () => {
      const user = {
        uid: 'd90ed360-e744-11e8-b4de-0d7fd38ce0e5',
      };
      let access_token = await AuthService.generateAccessToken(user);
      const req = {
        headers: {
          authorization: `JWT ${access_token}`,
        },
        query: {},
      };
      access_token = AuthService.extractAccessTokenFromRequest(req);
      const result = await AuthService.validateAccessToken(access_token);
      expect(result.id).toBe(user.uid);
    });
  });

  describe('Account creation', () => {
    setupWithData();

    test('createAdministratorAccount() should fail with invalid payload', async () => {
      const payload = {
        user: {},
        client: {},
      };
      try {
        await AuthService.createAdministratorAccount(payload);
      } catch (error) {
        expect(error.name).toBe('ValidationError');
      }
    });
    test('createAdministratorAccount() should succeed with valid payload', async () => {
      const payload = {
        user: {
          password: 'password',
          email: 'admin@starter.com',
          name: 'Starter Administrator',
        },
        client: {},
      };
      const result = await AuthService.createAdministratorAccount(payload);
      delete payload.user.password;
      expect(result).toMatchObject(payload);
      expect(result.user.id).toBeDefined();
      expect(result.user.uid).toBeDefined();
      expect(result.client.id).toBeDefined();
      expect(result.client.uid).toBeDefined();
      expect(result.client.uid).toBe(result.user.uid);
      expect(result.user._client).toBe(result.client.id);
    });

    test('createClientAccount() should fail with invalid payload', async () => {
      const payload = {
        user: {},
        client: {},
      };
      try {
        await AuthService.createClientAccount(payload);
      } catch (error) {
        expect(error.name).toBe('ValidationError');
      }
    });
    test('createClientAccount() should succeed with valid payload', async () => {
      const payload = {
        user: {
          password: 'password',
          email: 'client@starter.com',
          name: 'Starter Client',
          picture_uri: 'https://randomuser.me/api/portraits/lego/2.jpg',
        },
        client: {},
      };
      const result = await AuthService.createClientAccount(payload);
      delete payload.user.password;
      expect(result).toMatchObject(payload);
      expect(result.user.id).toBeDefined();
      expect(result.user.uid).toBeDefined();
      expect(result.client.id).toBeDefined();
      expect(result.client.uid).toBeDefined();
      expect(result.client.uid).toBe(result.user.uid);
      expect(result.user._client).toBe(result.client.id);
    });
  });
});
