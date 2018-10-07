'use strict';

const definition = {
  identity: 'sample_pet',

  tableName: 'SamplePet',

  attributes: {
    breed: { type: 'string' },
    type: { type: 'string' },
    name: { type: 'string' },

    _person: {
      model: 'sample_person',
    },
  },
};

module.exports = {
  definition,
  collection: {},
};
