'use strict';

const definition = {
  identity: 'client',

  tableName: 'Client',

  attributes: {
    _user: {
      model: 'user',
    },
  },
};

module.exports = {
  definition,
  collection: {},
};
