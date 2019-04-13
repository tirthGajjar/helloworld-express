'use strict';

const SANITIZE = { ...require('helloworld-lib/dist/common/sanitize') };

module.exports = SANITIZE;

SANITIZE.email = function (value) {
  return value.trim().toLowerCase();
};
