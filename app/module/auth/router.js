'use strict';

const express = require('express');

const { authenticatedMiddleware } = require('./auth.middleware');

const CONST = require('@/common/const');

const ERROR = require('@/common/error');

const User = require('./User.model');
const Client = require('./Client.model');

const AuthService = require('./auth.service');

const router = express.Router();

module.exports = {
  prefix: '',
  router,
};

router.post('/auth/login', async (req, res) => {
  let { username, password } = req.body;

  const audience = CONST.normalize(req.query.audience, CONST.ROLE, CONST.ROLE.CLIENT);

  if (!username || !password) {
    throw new ERROR.InvalidCredentialsError();
  }

  username = (username || '').trim().toLowerCase();

  const user = await User.collection.findOne({
    email: username,
  });

  if (!user || !CONST.ROLES_MAPPING[user.role].includes(audience)) {
    throw new ERROR.InvalidCredentialsError();
  }

  const validPassword = await AuthService.comparePassword(password, user.password);

  if (!validPassword) {
    throw new ERROR.InvalidCredentialsError();
  }

  const access_token = await AuthService.generateAccessToken(user, audience);

  res.send({
    access_token,
    audience,
    user,
  });
});

router.post('/auth/signup', async (req, res) => {
  const { user, client } = await AuthService.createClientAccount({
    user: req.body.user,
    client: req.body.client,
  });

  const access_token = await AuthService.generateAccessToken(user);

  res.send({
    access_token,
    user,
    client,
  });
});

router.post('/auth/password-reset/initiate', async (req, res) => {
  // @TODO implement
});

router.post('/auth/password-reset/continue', async (req, res) => {
  // @TODO implement
});

router.get('/auth/account', authenticatedMiddleware, async (req, res) => {
  const audience = req.audience;
  const user = req.user;

  let client = null;

  if (user._client) {
    client = await Client.collection.findOne(user._client);
  }

  res.send({
    audience,
    user,
    client,
  });
});

router.post('/auth/account/edit', async (req, res) => {
  // @TODO implement
});

router.post('/auth/account/change-email', async (req, res) => {
  // @TODO implement?
});

router.post('/auth/account/change-password', async (req, res) => {
  // @TODO implement
});
