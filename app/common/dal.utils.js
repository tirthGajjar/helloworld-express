'use strict';

const uuid = require('uuid');

const uniqueId = () => uuid.v1();
const randomToken = () => uuid.v4();

module.exports = {
  uniqueId,
  randomToken,
};
