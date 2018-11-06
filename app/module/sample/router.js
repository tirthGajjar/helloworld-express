'use strict';

const express = require('express');

const router = express.Router();

module.exports = {
  prefix: '/demo',
  router,
};

router.get('/', (req, res) => {
  res.send(req.query);
});

router.post('/', (req, res) => {
  res.send(req.body);
});
