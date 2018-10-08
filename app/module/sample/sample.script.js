'use strict';

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

process.env.INSTANCE_ID = 'script';

require('@/common/init');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const Data = require('@/common/data');

const SamplePerson = require('./SamplePerson.model');
const SamplePet = require('./SamplePet.model');

(async () => {
  try {
    Logger.debug('initiating ...');

    await Data.setup();

    Logger.debug('processing ...');

    const persons = await SamplePerson.collection.find({}).populate('_pets');

    Logger.debug(persons);
    Logger.debug(JSON.stringify(persons, null, 2));

    const pets = await SamplePet.collection.find({}).populate('_person');

    Logger.debug(pets);
    Logger.debug(JSON.stringify(pets, null, 2));

    Logger.debug('done');
    process.exit(0);
  } catch (error) {
    Logger.error(error);
    process.exit(1);
  }
})();
