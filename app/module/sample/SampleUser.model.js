'use strict';

const definition = {
  identity: 'sample_user',

  tableName: 'SampleUser',

  attributes: {
    firstName: { type: 'string' },

    lastName: { type: 'string' },

    _pets: {
      collection: 'sample_pet',
      via: '_owner',
    },
  },
};

module.exports = {
  definition,
  collection: {},
};
