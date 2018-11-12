'use strict';

/* eslint-env jest */

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const { spawn } = require('child_process');

const Data = require('@/common/data');
const DataUtils = require('@/common/data.utils');

const User = require('@/module/auth/User.model');
const AuthService = require('@/module/auth/auth.service');

function setupWithData(mode) {
  beforeAll(async () => {
    if (mode === 'seed') {
      await DataUtils.seed();
    } else {
      await DataUtils.clear();
    }

    await Data.setup();
  });

  afterAll(async (next) => {
    await Data.teardown();
    setTimeout(() => next(), 3000);
  });
}

function setupWithRunningApp(mode) {
  let cluster = null;

  beforeAll(async (next) => {
    jest.setTimeout(30000);

    if (mode === 'seed') {
      await DataUtils.seed();
    } else {
      await DataUtils.clear();
    }

    await Data.setup();

    Logger.debug('running cluster');
    cluster = spawn('pm2-runtime', ['--formatted', '--no-autorestart', 'pm2.test.json']);

    let started = false;

    cluster.stdout.on('data', (data) => {
      if (data.toString().includes('ready on port') && !started) {
        started = true;
        next();
      }
    });
  });

  afterAll((next) => {
    cluster.on('exit', () => next());
    cluster.kill('SIGINT');
    // setTimeout(() => cluster.kill('SIGTERM'), 2000);
  });
}

async function getAuthenticatedUserByEmail(email, audience) {
  const account = {};
  account.user = await User.collection.findOne({ email });
  account.access_token = await AuthService.generateAccessToken(account.user, audience);
  account.audience = audience;
  account.user = account.user.toJSON();
  return account;
}

// async function getAuthenticatedUserByEmail(email, audience) {
//   const response = await fetch(`${CONFIG.API_ENDPOINT}/auth/login`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       username: email,
//       password: 'password',
//     }),
//   });
//   const result = await response.json();
//   if (response.status !== 200) {
//     throw new Error(result.code);
//   }
//   return result;
// }

function testUnauthenticatedFetch(message, fetchPromise) {
  test(message, async () => {
    const response = await fetchPromise();
    expect(response.status).toBe(401);
    const result = await response.json();
    expect(result.code).toBe('Unauthenticated');
  });
}

function testUnauthorizedFetch(message, fetchPromise) {
  test(message, async () => {
    const response = await fetchPromise();
    expect(response.status).toBe(403);
    const result = await response.json();
    expect(result.code).toBe('Unauthorized');
  });
}

module.exports = {
  setupWithData,
  setupWithRunningApp,
  getAuthenticatedUserByEmail,
  testUnauthenticatedFetch,
  testUnauthorizedFetch,
};
