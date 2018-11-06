'use strict';

const express = require('express');

const { authenticatedMiddleware } = require('@/shared/middleware/auth.middleware');

const User = require('./User.model');

const router = express.Router();

module.exports = {
  prefix: '/',
  router,
};

router.post('/auth/signup', async (req, res) => {
  // ...
});

router.post('/auth/login', async (req, res) => {
  // ...
});

router.post('/auth/password-reset/initiate', async (req, res) => {
  // ...
});

router.post('/auth/password-reset/continue', async (req, res) => {
  // ...
});

router.get('/auth/account', authenticatedMiddleware, async (req, res) => {
  // ...
});
