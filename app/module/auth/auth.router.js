'use strict';

const express = require('express');

const { withAuthenticatedUserMiddleware } = require('./auth.middleware');

const CONST = require('@/common/const');

const ERROR = require('@/common/error');

const CONFIG = require('@/common/config');

const SANITIZE = require('@/common/sanitize');

const { $t } = require('@/common/intl');

const User = require('./User.model');
const Client = require('./Client.model');

const EmailJob = require('@/shared/email.job');

const AuthService = require('./auth.service');

const DataService = require('@/common/data.service');
const TemporaryDataStore = require('@/common/TemporaryDataStore.service');

const router = express.Router();

module.exports = {
  prefix: '',
  router,
};

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
    user: {
      role: user.role,
      email: user.email,
      ...user.toJSON(),
    },
  });
});

router.post('/auth/signup', async (req, res) => {
  const account = await AuthService.createClientAccount({
    user: req.body.user,
    client: req.body.client,
  });

  const { user } = account;

  const access_token = await AuthService.generateAccessToken(user);

  res.send({
    access_token,
    user: {
      role: user.role,
      email: user.email,
      ...user.toJSON(),
    },
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
    const token = DataService.generateToken();
    const tokenPayload = {
      email,
    };

    await TemporaryDataStore.storeWithExpiry(`password-reset:${token}`, tokenPayload, (3 * CONST.DURATION_DAY) / 1000);

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

  const tokenPayload = await TemporaryDataStore.retrieve(`password-reset:${token}`);

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

  await TemporaryDataStore.clear(`password-reset:${token}`);

  EmailJob.queue.add({
    to: user.email,
    subject: 'Password Reset Confirmation',
    template: 'app/module/auth/password-reset-done',
    templateContext: {
      user: user.toJSON(),
    },
  });

  res.send({});
});

router.get('/auth/account', withAuthenticatedUserMiddleware, async (req, res) => {
  const audience = req.audience;
  const user = req.user;

  let client = null;

  if (user._client) {
    client = await Client.collection.findOne(user._client);
  }

  res.send({
    audience,
    user: {
      role: user.role,
      email: user.email,
      ...user.toJSON(),
    },
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
