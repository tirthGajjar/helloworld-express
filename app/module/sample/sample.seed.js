'use strict';

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const SamplePerson = require('./SamplePerson.model');
const SamplePet = require('./SamplePet.model');

module.exports = async () => {
  const person = await SamplePerson.collection
    .create({
      firstName: 'Neil',
      lastName: 'Armstrong',
    })
    .fetch();

  const pet = await SamplePet.collection
    .create({
      breed: 'beagle',
      type: 'dog',
      name: 'Astro',
      _person: person.id,
    })
    .fetch();

  Logger.debug(pet);

  const persons = await SamplePerson.collection.find().populate('_pets');

  Logger.debug(persons);
};
