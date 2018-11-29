'use strict';

const SANITIZE = { ...require('starter-lib/dist/common/sanitize') };

module.exports = SANITIZE;

SANITIZE.email = function (value) {
  return value.trim().toLowerCase();
};
