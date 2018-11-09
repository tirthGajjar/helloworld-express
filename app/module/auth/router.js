'use strict';

const express = require('express');

const { authenticatedMiddleware } = require('@/shared/middleware/auth.middleware');

const CONST = require('@/common/const');

const ERROR = require('@/common/error');

const User = require('./User.model');

const AuthService = require('./auth.service');

const router = express.Router();

module.exports = {
  prefix: '',
  router,
};

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

router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  const scope = req.query.scope || CONST.ROLE.CLIENT;

  if (!username || !password) {
    throw new ERROR.RequestError();
  }

  const user = await User.collection.findOne({
    email: username,
  });

  if (!user) {
    throw new ERROR.RequestError();
  }

  const validPassword = await AuthService.comparePassword(password, user.password);

  if (!validPassword) {
    throw new ERROR.RequestError();
  }

  const access_token = await AuthService.generateAccessToken(user, scope);

  res.send({
    access_token,
    user,
  });
});

router.post('/auth/password-reset/initiate', async (req, res) => {
  // ...
});

router.post('/auth/password-reset/continue', async (req, res) => {
  // ...
});

router.get('/auth/account', authenticatedMiddleware, async (req, res) => {
  const user = req.user;

  res.send({
    user,
  });
});
