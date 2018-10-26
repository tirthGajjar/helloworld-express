# Node.js/Express Starter

A boilerplate and reference implementation for Node.js backend built with Express, Waterline, Bull, ...

## Requirements

- MongoDB v3.6
- Redis v4

## References

- [Documentation](./docs/)

## Usage

```sh
# install dependencies
npm install

# format code
npm run format

# lint code
npm run lint

# lint code for critical issues
npm run lint:critical
```

### Manipulating Database

```sh
# clear database
npm run db:clear

# seed database
npm run db:seed
```

### Running Application

```sh
# run app in cluster mode (all components)
npm run cluster

# run app core
npm run app:core

# run app api worker
npm run app:api

# run app job runner
npm run app:job

# run app console
npm run app:console
```

### Testing Application

```sh
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
npm run test:any -- app/module/sample/sample.unit.test.js
```
