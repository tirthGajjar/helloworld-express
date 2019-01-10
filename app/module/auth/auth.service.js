'use strict';

const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

const CONST = require('@/common/const');

const ERROR = require('@/common/error');

const AUTH_JWT_SECRET = process.env.AUTH_JWT_SECRET || 'secret';
const AUTH_JWT_EXPIRATION = process.env.AUTH_JWT_EXPIRATION || (30 * CONST.DURATION_DAY) / CONST.DURATION_SECOND; // in seconds, @TODO move to config? or param?

const User = require('./User.model');
const Client = require('../account/Client.model');

const SALT_ROUNDS = 8;

async function encryptPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, targetPassword) {
  return bcrypt.compare(password, targetPassword);
}

async function generateAccessToken(user, audience = CONST.AUDIENCE.CLIENT) {
  return new Promise((resolve, reject) => {
    const payload = {
      id: user.id,
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
        } else {
          // TokenStore.setex(`auth:${token}`, AUTH_JWT_EXPIRATION, user.id);
          resolve(token);
        }
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
        } else {
          // TokenStore.get(`auth:${token}`, () => { /* ... */});
          resolve(payload);
        }
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
  } else if (process.env.NODE_ENV === 'development' && req.query.access_token) {
    token = req.query.access_token;
  } else {
    token = '';
  }

  return token;
}

async function createAdministratorAccount({ user: user_data, client: client_data }) {
  user_data = user_data || {};
  client_data = client_data || {};

  let user_record = { ...user_data };
  let client_record = { ...client_data };

  let issues = [];
  let _issues;

  [user_record, _issues] = User.helpers.validate(user_record, true);
  issues = [...issues, ..._issues];

  [client_record, _issues] = Client.helpers.validate(client_record, true);
  issues = [...issues, ..._issues];

  if (issues.length) {
    throw new ERROR.ValidationError(null, null, { issues });
  }

  user_record.role = CONST.ROLE.ADMIN;
  user_record.password = await encryptPassword(user_data.password || 'password');

  let user = await User.collection.create(user_record).fetch();

  const client = await Client.collection
    .create({
      ...client_record,
      id: user.id,
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

async function createClientAccount({ user: user_data, client: client_data }) {
  user_data = user_data || {};
  client_data = client_data || {};

  let user_record = { ...user_data };
  let client_record = { ...client_data };

  let issues = [];
  let _issues;

  [user_record, _issues] = User.helpers.validate(user_record, true);
  issues = [...issues, ..._issues];

  [client_record, _issues] = Client.helpers.validate(client_record, true);
  issues = [...issues, ..._issues];

  if (issues.length) {
    throw new ERROR.ValidationError(null, null, { issues });
  }

  user_record.role = CONST.ROLE.CLIENT;
  user_record.password = await encryptPassword(user_data.password || 'password');

  let user = await User.collection.create(user_record).fetch();

  const client = await Client.collection
    .create({
      ...client_record,
      id: user.id,
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
