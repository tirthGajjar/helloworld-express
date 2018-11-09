'use strict';

const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

const CONST = require('@/common/const');
const CONFIG = require('@/common/config');

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

async function generateAccessToken(user, scope = CONST.ROLE.CLIENT) {
  return new Promise((resolve, reject) => {
    const payload = {
      id: user.uid,
      scope,
    };

    // @TODO move scope to audience

    jsonwebtoken.sign(
      payload,
      AUTH_JWT_SECRET,
      {
        audience: scope,
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

async function isAccessTokenValid(token, scope = CONST.ROLE.CLIENT) {
  return new Promise((resolve, reject) => {
    jsonwebtoken.verify(
      token,
      AUTH_JWT_SECRET,
      {
        // audience: scope,
      },
      (err, payload) => {
        if (err) {
          reject(err);
          return;
        }

        // TokenStore.get(`auth:${token}`, () => { /* ... */});

        resolve(payload);
      },
    );
  });
}

async function createAdminAccount({ user: userData, client: clientData }) {
  userData.role = CONST.ROLE.ADMIN;
  userData.password = await encryptPassword(userData.password);

  let user = await User.collection.create(userData).fetch();

  const client = await Client.collection
    .create({
      ...clientData,
      uid: user.uid,
      _user: user.id,
    })
    .fetch();

  user = await User.collection
    .update(user.id, {
      _client: client.id,
    })
    .fetch();

  return {
    user,
    client,
  };
}

async function createClientAccount({ user: userData, client: clientData }) {
  userData.role = CONST.ROLE.CLIENT;
  userData.password = await encryptPassword(userData.password);

  let user = await User.collection.create(userData).fetch();

  const client = await Client.collection
    .create({
      ...clientData,
      uid: user.uid,
      _user: user.id,
    })
    .fetch();

  user = await User.collection
    .update(user.id, {
      _client: client.id,
    })
    .fetch();

  return {
    user,
    client,
  };
}

module.exports = {
  encryptPassword,
  comparePassword,
  generateAccessToken,
  isAccessTokenValid,
  createAdminAccount,
  createClientAccount,
};
