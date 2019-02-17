'use strict';

/* eslint-env jest */

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const User = require('@/module/auth/User.model');
const AuthService = require('@/module/auth/auth.service');

async function getAuthenticatedUserByEmail(email, audience) {
  const account = {};
  account.user = await User.collection.findOne({ email });
  if (!account.user) {
    throw new Error('User not found');
  }
  account.access_token = await AuthService.generateAccessToken(account.user, audience);
  account.audience = audience;
  account.user = {
    ...account.user.toJSON(),
    role: account.user.role,
    email: account.user.email,
  };
  return JSON.parse(JSON.stringify(account));
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
  getAuthenticatedUserByEmail,
  testUnauthenticatedFetch,
  testUnauthorizedFetch,
};
