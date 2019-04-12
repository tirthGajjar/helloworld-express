'use strict';

const express = require('express');

const { withUserAsClient } = require('../auth/auth.middleware');

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
  const { name, picture_uri } = req.body;

  const user = await User.collection.updateOne(req.user.id, {
    name,
    picture_uri,
  });

  res.send({
    user,
  });
});
