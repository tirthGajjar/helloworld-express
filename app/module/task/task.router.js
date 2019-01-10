'use strict';

const express = require('express');

const ERROR = require('@/common/error');

const { withAuthenticatedUser } = require('@/module/auth/auth.middleware');

const Task = require('./Task.model');

const router = express.Router();

module.exports = {
  prefix: '/',
  router,
};

router.use(withAuthenticatedUser);

// @TODO validate `task_id` route param: if value is not a uuid, throw 404 status

// router.param('task_id', (req, res, next, id) => {
//   console.log(id);
//   if (!VALIDATE.isUUID(id)) {
//     next(404);
//     return;
//   }
//   next();
// });

router.get('/task', async (req, res) => {
  const data = await Task.collection.find().populate('_owner');

  res.send({
    data,
  });
});

router.get('/task/:task_id', async (req, res) => {
  const data = await Task.collection.findOne(req.params.task_id);

  if (!data) {
    throw new ERROR.NotFoundError();
  }

  res.send({
    data,
  });
});

router.post('/task/create', async (req, res) => {
  const [record, issues] = Task.helpers.validate(req.body.data, true);

  if (issues.length) {
    throw new ERROR.ValidationError(null, null, { issues });
  }

  const data = await Task.collection.create(record).fetch();

  res.send({
    data,
  });
});

router.post('/task/:task_id/edit', async (req, res) => {
  const [record, issues] = Task.helpers.validate(req.body.data);

  if (issues.length) {
    throw new ERROR.ValidationError(null, null, { issues });
  }

  const data = await Task.collection.updateOne(req.params.task_id, record);

  if (!data) {
    throw new ERROR.NotFoundError();
  }

  res.send({
    data,
  });
});

router.post('/task/:task_id/delete', async (req, res) => {
  const data = await Task.collection.archiveOne(req.params.task_id);

  if (!data) {
    throw new ERROR.NotFoundError();
  }

  res.send({});
});
