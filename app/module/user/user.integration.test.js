'use strict';

/* eslint-env jest */

const { setupWithRunningApp } = require('@/test/setup');
const { getAuthenticatedUserByEmail, testUnauthenticatedFetch } = require('@/test/utils');

const CONST = require('@/common/const');

const CONFIG = require('@/common/config');

// const Logger = require('@/common/logger').createLogger($filepath(__filename));

describe('User integration test', () => {
  describe('/user', () => {
    setupWithRunningApp('seed');

    const DATA = {};

    DATA.CLIENT = {
      email: 'client@starter.emiketic.com',
    };

    const CACHE = {};

    beforeAll(async () => {
      CACHE.client = await getAuthenticatedUserByEmail(DATA.CLIENT.email, CONST.ROLE.CLIENT);
    });

    testUnauthenticatedFetch('GET /user should fail with unauthenticated access', () => fetch(`${CONFIG.API_ENDPOINT}/user`));

    test('GET /user should succeed with authenticated access', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/user`, {
        headers: {
          Authorization: `Bearer ${CACHE.client.access_token}`,
        },
      });
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.audience).toBe(CONST.AUDIENCE.CLIENT);
      expect(result.user).toMatchObject(CACHE.client.user);
    });
  });
});
