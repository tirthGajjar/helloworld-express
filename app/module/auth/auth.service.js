'use strict';

const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

const CONST = require('@/common/const');

const ERROR = require('@/common/error');

const AUTH_JWT_SECRET = process.env.AUTH_JWT_SECRET || 'secret';
const AUTH_JWT_EXPIRATION = process.env.AUTH_JWT_EXPIRATION || (30 * CONST.DURATION_DAY) / CONST.DURATION_SECOND; // in seconds, @TODO move to config? or param?

const User = require('./User.model');
const Client = require('./Client.model');

const SALT_ROUNDS = 8;

async function encryptPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, targetPassword) {
  return bcrypt.compare(password, targetPassword);
}

async function generateAccessToken(user, audience = CONST.ROLE.CLIENT) {
  return new Promise((resolve, reject) => {
    const payload = {
      id: user.uid,
    };

    jsonwebtoken.sign(
      payload,
      AUTH_JWT_SECRET,
      {
        audience,
        expiresIn: AUTH_JWT_EXPIRATION,
        noTimestamp: true,
      },
      (err, token) => {
        if (err) {
          reject(err);
          return;
        }

        // TokenStore.setex(`auth:${token}`, AUTH_JWT_EXPIRATION, user.uid);

        resolve(token);
      },
    );
  });
}

async function validateAccessToken(token, audience = CONST.ROLE.CLIENT) {
  return new Promise((resolve, reject) => {
    jsonwebtoken.verify(
      token,
      AUTH_JWT_SECRET,
      {
        // audience,
      },
      (err, payload) => {
        if (err) {
          // reject(err);
          resolve(null);
          return;
        }

        // TokenStore.get(`auth:${token}`, () => { /* ... */});

        resolve(payload);
      },
    );
  });
}

const AUTH_HEADER_BEARER = /^Bearer\ /g;
const AUTH_HEADER_JWT = /^JWT\ /g;

function extractAccessTokenFromRequest(req) {
  let token;

  token = req.headers.authorization || '';

  if (AUTH_HEADER_BEARER.test(token)) {
    token = token.replace(AUTH_HEADER_BEARER, '').trim();
  } else if (AUTH_HEADER_JWT.test(token)) {
    token = token.replace(AUTH_HEADER_JWT, '').trim();
  } else {
    token = '';
  }

  return token;
}

async function createAdministratorAccount({ user: userData, client: clientData }) {
  userData = userData || {};
  clientData = userData || {};

  userData.role = CONST.ROLE.ADMIN;

  let issues = [];
  let _issues;

  [userData, _issues] = User.helpers.validate(userData, true);
  issues = [...issues, ..._issues];

  [clientData, _issues] = Client.helpers.validate(clientData, true);
  issues = [...issues, ..._issues];

  if (issues.length) {
    throw new ERROR.ValidationError(null, null, { issues });
  }

  userData.password = await encryptPassword(userData.password);

  let user = await User.collection.create(userData).fetch();

  const client = await Client.collection
    .create({
      ...clientData,
      uid: user.uid,
      _user: user.id,
    })
    .fetch();

  user = await User.collection.updateOne(user.id, {
    _client: client.id,
  });

  return {
    user,
    client,
  };
}

async function createClientAccount({ user: userData, client: clientData }) {
  userData = userData || {};
  clientData = userData || {};

  userData.role = CONST.ROLE.CLIENT;

  let issues = [];
  let _issues;

  [userData, _issues] = User.helpers.validate(userData, true);
  issues = [...issues, ..._issues];

  [clientData, _issues] = Client.helpers.validate(clientData, true);
  issues = [...issues, ..._issues];

  if (issues.length) {
    throw new ERROR.ValidationError(null, null, { issues });
  }

  userData.password = await encryptPassword(userData.password);

  let user = await User.collection.create(userData).fetch();

  const client = await Client.collection
    .create({
      ...clientData,
      uid: user.uid,
      _user: user.id,
    })
    .fetch();

  user = await User.collection.updateOne(user.id, {
    _client: client.id,
  });

  return {
    user,
    client,
  };
}

module.exports = {
  encryptPassword,
  comparePassword,
  generateAccessToken,
  validateAccessToken,
  extractAccessTokenFromRequest,
  createAdministratorAccount,
  createClientAccount,
};
