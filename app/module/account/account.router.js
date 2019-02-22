'use strict';

const express = require('express');

const { withAuthenticatedUser, withUserAsClient } = require('../auth/auth.middleware');

const User = require('../auth/User.model');

const router = express.Router();

module.exports = {
  prefix: '',
  router,
};

router.get('/account', withAuthenticatedUser, withUserAsClient, async (req, res) => {
  const { audience, user, client } = req;

  res.send({
    audience,
    user: User.collection.toAccount(user),
    client,
  });
});

router.post('/account/edit', withAuthenticatedUser, async (req, res) => {
  // @TODO implement
});

router.post('/account/change-password', withAuthenticatedUser, async (req, res) => {
  // @TODO implement
});

router.post('/account/change-email', async (req, res) => {
  // @TODO implement?
});
