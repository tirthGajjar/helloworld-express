'use strict';

/* eslint-env jest */

const { setupWithRunningApp } = require('@/test/setup');

const CONFIG = require('@/common/config');

// const Logger = require('@/common/logger').createLogger($filepath(__filename));

describe('Sample integration test', () => {
  describe('/demo', () => {
    setupWithRunningApp();

    test('GET /demo', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/demo?a=1&b[c]=2&d[]=3`);
      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.a).toBe('1');
      expect(result.b.c).toBe('2');
      expect(result.d[0]).toBe('3');
    });

    test('POST /demo', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/demo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          a: 1,
          b: { c: 2 },
          d: [3],
        }),
      });
      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.a).toBe(1);
      expect(result.b.c).toBe(2);
      expect(result.d[0]).toBe(3);
    });
  });

  // describe('/...', () => {
  //   setupWithRunningApp();

  //   test('GET /', async () => {});
  // });
});
