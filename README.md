# Starter Backend (Node.js/Express)

![](https://img.shields.io/david/emiketic/emiketic-starter-express.svg?style=for-the-badge)

A boilerplate and reference implementation for Node.js backend built with Express, Waterline, Bull, GraphQL, ...

## Requirements

- MongoDB v3.6
- Redis v4

## References

- [Documentation](./docs/)

## Features

- modular setup with some convention over configuration
  - `*.model.js` for data models
  - `*seed.js` for data seed
  - `*.job.js` for Bull' job definition
  - `*router.js` for express' routing
- manages data with Waterline
- auto-exposes Waterline schema as GraphQL
- enables temporary (backed by Redis) and permanent (backed by MongoDB) data key-value storage
- enables one-time and repetitive/cron jobs and managed by Bull
- ...

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

# generate docs
npm run docs
```

### Managing Database

```sh
# clear database
npm run db:clear

# seed database
npm run db:seed
```

### Running Application

```sh
# run app core, api worker, and job runner
npm run app

## OR

# run app core
npm run app:core

# run app api worker
npm run app:api

# run app job runner
npm run app:job

# run app console
npm run app:console
```

### Testing

```sh
# run all tests
npm run test

# run unit tests
npm run test:unit

# run integration tests
npm run test:integration

# run unit tests for specific module
npm run test:any -- '/task/*.unit.test.'

# run integration tests for specific module
npm run test:any -- '/task/*.integration.test.'

# run specific test
npm run test:any -- app/module/task/task.unit.test.js
```
