'use strict';

const CONST = require('@/common/const');

const definition = {
  identity: 'user',

  tableName: 'User',

  attributes: {
    role: {
      type: 'string',
      // isIn: Object.values(CONST.ROLE),
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
