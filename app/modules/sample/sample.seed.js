'use strict';

const Logger = require('@/common/logger').createLogger($filepath(__filename));

module.exports = async (ORM) => {
  const User = ORM.models.SampleUser;
  const Pet = ORM.models.SamplePet;

  const user = await User.create({
    firstName: 'Neil',
    lastName: 'Armstrong',
  }).fetch();

  const pet = await Pet.create({
    breed: 'beagle',
    type: 'dog',
    name: 'Astro',
    _owner: user.id,
  }).fetch();

  Logger.debug(pet);

  const users = await User.find().populate('_pets');

  Logger.debug(users);
};
