'use strict';

const definition = {
  identity: 'sample_person',

  tableName: 'SamplePerson',

  attributes: {
    firstName: { type: 'string' },

    lastName: { type: 'string' },

    _pets: {
      collection: 'sample_pet',
      via: '_person',
    },
  },
};

module.exports = {
  definition,
  collection: {},
};
