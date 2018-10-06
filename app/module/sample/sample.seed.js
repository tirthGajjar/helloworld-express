'use strict';

const Logger = require('@/common/logger').createLogger($filepath(__filename));

module.exports = async (DAL) => {
  const User = DAL.models.SampleUser;
  const Pet = DAL.models.SamplePet;

  const user = await User.collection
    .create({
      firstName: 'Neil',
      lastName: 'Armstrong',
    })
    .fetch();

  const pet = await Pet.collection
    .create({
      breed: 'beagle',
      type: 'dog',
      name: 'Astro',
      _owner: user.id,
    })
    .fetch();

  Logger.debug(pet);

  const users = await User.collection.find().populate('_pets');

  Logger.debug(users);
};
