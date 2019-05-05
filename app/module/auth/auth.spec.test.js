'use strict';

/* eslint-env jest */

const { setupWithRunningApp } = require('@/test/setup');
const { testUnauthenticatedFetch, testUnauthorizedFetch } = require('@/test/utils');

const CONST = require('@/common/const');

const CONFIG = require('@/common/config');

// const Logger = require('@/common/logger').createLogger($filepath(__filename));

describe('Authentication', () => {
  describe('client scenario', () => {
    setupWithRunningApp();

    /* @TODO client scenario
     * - retrieve user profile as unauthenticated with failure
     * - signup X as client with failure and success
     *   - should not be able to signup with existing email
     * - login X as client with failure and success
     * - retrieve user profile with failure (unauthenticated) and success (authenticated)
     * - initiate password reset as X with failure and success
     * - perform password reset as X with failure and success
     * - relogin X as client
     * - make sure X login as admin do not work
     * - make sure X access_token do not work for other audiences
     */

    const DATA = {};

    DATA.CLIENT = {
      user: {
        password: 'password',
        email: 'client@helloworld.emiketic.com',
        name: 'Client',
        picture_uri: 'https://randomuser.me/api/portraits/lego/2.jpg',
      },
      client: {},
    };

    const CACHE = {};

    test('POST /auth/signup should fail with invalid payload', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {},
          client: {},
        }),
      });
      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.code).toBe('InvalidRequest');
    });

    test('POST /auth/signup should succeed with valid payload', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: DATA.CLIENT.user,
          client: DATA.CLIENT.client,
        }),
      });
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.access_token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.password).toBeUndefined();
      expect(result.user.email).toBe(DATA.CLIENT.user.email);
      CACHE.client = result;
    });

    test('POST /auth/login should fail with invalid credentials', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'incorrect@helloworld.emiketic.com',
          password: 'incorrect',
        }),
      });
      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.code).toBe('InvalidCredentials');
    });

    test('POST /auth/login should succeed with valid credentials', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: DATA.CLIENT.user.email,
          password: DATA.CLIENT.user.password,
        }),
      });
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.access_token).toBeDefined();
      expect(result.audience).toBe(CONST.AUDIENCE.CLIENT);
      expect(result.user).toBeDefined();
      CACHE.client = result;
    });

    testUnauthenticatedFetch('GET /auth/check should fail with unauthenticated access', () => fetch(`${CONFIG.API_ENDPOINT}/auth/check`));

    test('GET /auth/check should succeed with authenticated access', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/auth/check`, {
        headers: {
          Authorization: `Bearer ${CACHE.client.access_token}`,
        },
      });
      expect(response.status).toBe(200);
    });

    // ...
  });

  // describe('admin as client', () => {
  //   setupWithRunningApp('seed');

  //   const CACHE = {};

  //   /* @TODO admin as client scenario
  //    * - login Y as client
  //    * - retrieve user profile for Y
  //    * - make sure Y access_token do not work for other audiences
  //    */
  // });

  // describe('admin as admin', () => {
  //   setupWithRunningApp('seed');

  //   const CACHE = {};

  //   /* @TODO admin as admin scenario
  //    * - login Y as admin
  //    * - retrieve user profile ad Y
  //    * - make sure Y access_token do not work for other audiences
  //    */
  // });

  // describe('client as admin', () => {
  //   setupWithRunningApp('seed');

  //   const CACHE = {};

  //   /* @TODO client as admin scenario
  //    * - login Y as admin should fail
  //    */
  // });
});
