# EMIKETIC Express Starter

...

## Requirements

- MongoDB v3.6
- Redis v4

## Usage

```sh
# install dependencies
npm install

# lint code for critical issues
npm run lint:critical

# lint code
npm run lint

# format code
npm run format

# run all tests
npm run test

# run unit tests
npm run test:unit

# run integration tests
npm run test:integration

# run unit tests for specific module
npm run test:any -- '/sample/*.unit.test.'

# run integration tests for specific module
npm run test:any -- '/sample/*.integration.test.'

# run specific test
npm run test:any -- app/modules/sample/sample.unit.test.js

# run app in cluster mode (all components)
npm run cluster

# run api worker
npm run app:api

# run job runner
npm run app:job

# run console
npm run app:console
```
