'use strict';

const CONST = require('@/common/const');
7
const definition = {
  identity: 'user',

  tableName: 'User',

  attributes: {
    role: {
      type: 'string',
      isIn: CONST.ROLE,
      required: true,
    },
    email: {
      type: 'string',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    picture_uri: {
      type: 'string',
      required: true,
    },
  },
};

module.exports = {
  definition,
  collection: {},
};
