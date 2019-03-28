'use strict';

const express = require('express');

const { withAuthenticatedUser, withUserAsClient } = require('../auth/auth.middleware');

const ERROR = require('@/common/error');

const User = require('../auth/User.model');

const router = express.Router();

module.exports = {
  router,
};

router.get('/user', withUserAsClient, async (req, res) => {
  const { audience, user, client } = req;

  res.send({
    audience,
    user: User.collection.toUserRecord(user),
    client,
  });
});

router.post('/user/edit', async (req, res) => {
  const payload = req.body;
  const availableUser = await User.collection.findOne(req.user.id);

  if (!availableUser) {
    throw new ERROR.NotFoundError();
  }

  const user = await User.collection.updateOne(
    {
      id: req.user.id,
    },
    {
      name: payload.name,
    },

    {
      picture_uri: payload.picture_uri,
    },
  );
  res.send({
    user,
  });
});
