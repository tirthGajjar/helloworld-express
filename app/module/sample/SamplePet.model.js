'use strict';

const definition = {
  identity: 'sample_pet',

  tableName: 'SamplePet',

  attributes: {
    breed: { type: 'string' },
    type: { type: 'string' },
    name: { type: 'string' },

    _owner: {
      model: 'sample_user',
    },
  },
};

module.exports = {
  definition,
  collection: {},
};
