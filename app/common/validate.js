'use strict';

const VALIDATE = { ...require('starter-lib/dist/common/validate') };

module.exports = VALIDATE;

const UUID_REGEXP = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/;

VALIDATE.isID = function isID(value) {
  return UUID_REGEXP.test(value);
};
