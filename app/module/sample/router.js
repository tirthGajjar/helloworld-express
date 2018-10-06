'use strict';

const express = require('express');

const router = express.Router();

module.exports = {
  prefix: '',
  router,
};

router.get('/', (req, res) => {
  res.send(req.query);
});

router.post('/', (req, res) => {
  res.send(req.body);
});
