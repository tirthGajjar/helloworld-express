'use strict';

const express = require('express');

const { withAuthenticatedUser } = require('./auth.middleware');

const CONST = require('~/common/const');

const ERROR = require('~/common/error');

const CONFIG = require('~/common/config');

const SANITIZE = require('~/common/sanitize');

const User = require('./User.model');

const EmailJob = require('~/shared/email.job');

const AuthService = require('./auth.service');

const DataUtils = require('~/common/data/utils');
const TransientDataStore = require('~/common/TransientDataStore.service');

const router = express.Router();

module.exports = {
  prefix: '',
  router,
};

router.get('/auth/check', withAuthenticatedUser, async (req, res) => {
  res.send({});
});

router.post('/auth/login', async (req, res) => {
  let { username, password } = req.body;

  const audience = CONST.normalize(req.query.audience, CONST.AUDIENCE, CONST.AUDIENCE.CLIENT);

  if (!username || !password) {
    throw new ERROR.InvalidCredentialsError();
  }

  username = (username || '').trim().toLowerCase();

  const user = await User.collection.findOne({
    email: username,
  });

  if (!user || !CONST.AUDIENCE_TO_ROLES[audience].includes(user.role)) {
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
    user: User.collection.toUserRecord(user),
  });
});

router.post('/auth/signup', async (req, res) => {
  const record = await AuthService.createClientUser({
    user: req.body.user,
    client: req.body.client,
  });

  const { user } = record;

  EmailJob.queue.add({
    to: user.email,
    subject: 'Welcome to Hello World',
    template: 'app/module/auth/signup-welcome',
    templateContext: {
      continue_url: `${CONFIG.CLIENT_APP_URL}/signup/perform?token=12346789`,
    },
  });

  const access_token = await AuthService.generateAccessToken(user);

  res.send({
    access_token,
    user: User.collection.toUserRecord(user),
  });
});

router.post('/auth/password-reset/initiate', async (req, res) => {
  const email = SANITIZE.email(req.body.email || '');

  if (!email) {
    throw new ERROR.InvalidRequestError(); // @TODO better code and message
  }

  const user = await User.collection.findOne({
    email,
  });

  if (user) {
    const token = DataUtils.generateToken();
    const tokenPayload = {
      email,
    };

    await TransientDataStore.storeWithExpiry(`password-reset:${token}`, tokenPayload, (3 * CONST.DURATION_DAY) / 1000);

    EmailJob.queue.add({
      to: email,
      subject: 'Password Reset',
      template: 'app/module/auth/password-reset',
      templateContext: {
        continue_url: `${CONFIG.CLIENT_APP_URL}/password-reset/perform?token=${token}`,
      },
    });
  }

  res.send({});
});

router.post('/auth/password-reset/perform', async (req, res) => {
  const { token, password } = req.body;

  const tokenPayload = await TransientDataStore.retrieve(`password-reset:${token}`);

  if (tokenPayload === null) {
    throw new ERROR.InvalidRequestError(); // @TODO better code and message
  }

  const encryptedPassword = await AuthService.encryptPassword(password);

  const user = await User.collection.updateOne(
    {
      email: tokenPayload.email,
    },
    {
      password: encryptedPassword,
    },
  );

  await TransientDataStore.clear(`password-reset:${token}`);

  EmailJob.queue.add({
    to: user.email,
    subject: 'Password Reset Confirmation',
    template: 'app/module/auth/password-reset-complete',
    templateContext: {
      user: user.toJSON(),
    },
  });

  res.send({});
});

router.post('/auth/change-email', withAuthenticatedUser, async (req, res) => {
  const payload = req.body;

  const existingUser = await User.collection.findOne({
    email: payload.email,
  });

  if (!existingUser) {
    throw new ERROR.NotFoundError();
  }

  const user = await User.collection.updateOne(req.user.id, {
    email: payload.email,
  });

  // @TODO send validation email

  res.send({
    user,
  });
});

router.post('/auth/change-password', withAuthenticatedUser, async (req, res) => {
  const { password, newPassword } = req.body;

  const isIdentical = await AuthService.comparePassword(password, req.user.password);

  if (!isIdentical) {
    throw new ERROR.InvalidCredentialsError();
  }

  const encryptedNewPassword = await AuthService.encryptPassword(newPassword);

  await User.collection.updateOne(req.user.id, {
    password: encryptedNewPassword,
  });

  res.send({});
});
