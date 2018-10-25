'use strict';

const express = require('express');

const router = express.Router();

module.exports = {
  prefix: '/user',
  router,
};

router.param('userId', (req, res, next, id) => {
  req.params.userId = parseInt(id, 10);
  next();
});

router.get('/:userId/profile', (req, res) => {
  res.send(req.params);
});

// router.get('/:userId/profile', (req, res) => {
//   res.send(req.params);
// });

// router.get('/:userId/profile', (req, res, next) => {
//   User.findOne({ id: req.params.userId })
//     .fetch()
//     .then((user) => res.send(user))
//     .catch(next);
// });

// router.get('/:userId/profile', async (req, res, next) => {
//   try {
//     const user = await User.findOne({ id: req.params.userId }).fetch();
//     res.send(user);
//   } catch (e) {
//     next(e);
//   }
// });

// const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// router.get(
//   '/:userId/profile',
//   asyncHandler(async (req, res) => {
//     const user = await User.findOne({ id: req.params.userId }).fetch();
//     res.send(user);
//   }),
// );
