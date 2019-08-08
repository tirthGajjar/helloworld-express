'use strict';

const express = require('express');

const ERROR = require('~/common/error');

const { withAuthenticatedUser } = require('~/module/auth/auth.middleware');

const Post = require('./Post.model');

const router = express.Router();

module.exports = {
  prefix: '',
  router,
};

// @TODO validate `post_id` route param: if value is not a uuid, throw 404 status

// router.param('post_id', (req, res, next, id) => {
//   console.log(id);
//   if (!VALIDATE.isUUID(id)) {
//     next(404);
//     return;
//   }
//   next();
// });

router.get('/client/post', withAuthenticatedUser, async (req, res) => {
  const data = await Post.collection.find().where({
    _owner: req.user.id,
  });

  res.send({
    data,
  });
});

router.get('/client/post/:post_id', withAuthenticatedUser, async (req, res) => {
  const data = await Post.collection.findOne(req.params.post_id);

  if (!data) {
    throw new ERROR.NotFoundError();
  }

  res.send({
    data,
  });
});

router.post('/client/post/create', withAuthenticatedUser, async (req, res) => {
  const [record, issues] = Post.helpers.validate(
    {
      ...req.body.data,
      _owner: req.user.id,
    },
    true,
  );

  if (issues.length) {
    throw new ERROR.ValidationError(null, null, { issues });
  }

  // record._owner = req.user.id;

  const data = await Post.collection.create(record).fetch();

  res.send({
    data,
  });
});

router.post('/client/post/:post_id/edit', withAuthenticatedUser, async (req, res) => {
  const [record, issues] = Post.helpers.validate(req.body.data);

  if (issues.length) {
    throw new ERROR.ValidationError(null, null, { issues });
  }

  const data = await Post.collection.updateOne(req.params.post_id, record);

  if (!data) {
    throw new ERROR.NotFoundError();
  }

  res.send({
    data,
  });
});

router.post('/client/post/:post_id/delete', withAuthenticatedUser, async (req, res) => {
  const data = await Post.collection.archiveOne(req.params.post_id);

  if (!data) {
    throw new ERROR.NotFoundError();
  }

  res.send({});
});
