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
        id: 'd90ed360-e744-11e8-b4de-0d7fd38ce0e5',
      };
      const access_token = await AuthService.generateAccessToken(user);
      const result = await AuthService.validateAccessToken(access_token);
      expect(result.aud).toBe(CONST.AUDIENCE.CLIENT);
      expect(result.id).toBe(user.id);
    });
    test('access token generation and validation should succeed with admin', async () => {
      const user = {
        id: 'd90ed360-e744-11e8-b4de-0d7fd38ce0e5',
      };
      const access_token = await AuthService.generateAccessToken(user, CONST.AUDIENCE.ADMIN);
      const result = await AuthService.validateAccessToken(access_token);
      expect(result.aud).toBe(CONST.AUDIENCE.ADMIN);
      expect(result.id).toBe(user.id);
    });
  });

  describe('access token extraction', () => {
    test('access token extraction should fail with authorization header', async () => {
      const user = {
        id: 'd90ed360-e744-11e8-b4de-0d7fd38ce0e5',
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
        id: 'd90ed360-e744-11e8-b4de-0d7fd38ce0e5',
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
      expect(result.id).toBe(user.id);
    });

    test('access token extraction should succeed with `JWT` authorization header', async () => {
      const user = {
        id: 'd90ed360-e744-11e8-b4de-0d7fd38ce0e5',
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
      expect(result.id).toBe(user.id);
    });
  });

  describe('User creation', () => {
    setupWithData();

    test('createAdministratorUser() should fail with invalid payload', async () => {
      const payload = {
        user: {},
        client: {},
      };
      try {
        await AuthService.createAdministratorUser(payload);
      } catch (error) {
        expect(error.name).toBe('ValidationError');
      }
    });
    test('createAdministratorUser() should succeed with valid payload', async () => {
      const payload = {
        user: {
          password: 'password',
          email: 'admin@helloworld.emiketic.com',
          name: 'Administrator',
        },
        client: {},
      };
      const result = await AuthService.createAdministratorUser(payload);
      delete payload.user.password;
      expect(result).toMatchObject(payload);
      expect(result.user.id).toBeDefined();
      expect(result.client.id).toBeDefined();
      expect(result.client.id).toBe(result.user.id);
      expect(result.user._client).toBe(result.client.id);
    });

    test('createClientUser() should fail with invalid payload', async () => {
      const payload = {
        user: {},
        client: {},
      };
      try {
        await AuthService.createClientUser(payload);
      } catch (error) {
        expect(error.name).toBe('ValidationError');
      }
    });
    test('createClientUser() should succeed with valid payload', async () => {
      const payload = {
        user: {
          password: 'password',
          email: 'client@helloworld.emiketic.com',
          name: 'Client',
          picture_uri: 'https://randomuser.me/api/portraits/lego/2.jpg',
        },
        client: {},
      };
      const result = await AuthService.createClientUser(payload);
      delete payload.user.password;
      expect(result).toMatchObject(payload);
      expect(result.user.id).toBeDefined();
      expect(result.client.id).toBeDefined();
      expect(result.client.id).toBe(result.user.id);
      expect(result.user._client).toBe(result.client.id);
    });
  });
});
