'use strict';

/* eslint-env jest */

const { setupWithRunningApp } = require('@/test/setup');
const { getAuthenticatedUserByEmail, testUnauthenticatedFetch } = require('@/test/utils');

const CONST = require('@/common/const');

const CONFIG = require('@/common/config');

// const Logger = require('@/common/logger').createLogger($filepath(__filename));

describe('Profile integration test', () => {
  describe('/self/profile', () => {
    setupWithRunningApp('seed');

    const DATA = {};

    DATA.CLIENT = {
      email: 'client@helloworld.emiketic.com',
    };

    const CACHE = {};

    beforeAll(async () => {
      CACHE.client = await getAuthenticatedUserByEmail(DATA.CLIENT.email, CONST.ROLE.CLIENT);
    });

    testUnauthenticatedFetch('GET /self/profile should fail with unauthenticated access', () => fetch(`${CONFIG.API_ENDPOINT}/self/profile`));

    test('GET /self/profile should succeed with authenticated access', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/self/profile`, {
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
