'use strict';

/* eslint-env jest */

const { setupWithRunningApp, getAuthenticatedUserByEmail, testUnauthenticatedFetch } = require('@/test/setup');

const CONST = require('@/common/const');

const CONFIG = require('@/common/config');

// const Logger = require('@/common/logger').createLogger($filepath(__filename));

describe('Account integration test', () => {
  describe('/account', () => {
    setupWithRunningApp('seed');

    const DATA = {};

    DATA.CLIENT_ACCOUNT = {
      email: 'client@starter.com',
    };

    const CACHE = {};

    beforeAll(async () => {
      CACHE.client = await getAuthenticatedUserByEmail(DATA.CLIENT_ACCOUNT.email, CONST.ROLE.CLIENT);
    });

    testUnauthenticatedFetch('GET /account should fail with unauthenticated access', () => fetch(`${CONFIG.API_ENDPOINT}/account`));

    test('GET /account should succeed with authenticated access', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/account`, {
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
