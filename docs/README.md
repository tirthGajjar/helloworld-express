# Overview

This application is designed with robustness, modularity and salability in mind.

## Folder Structure

```
app
├── common
├── lib
├── data
├── module
│   ├── sample
│   │   ├── router.js
│   │   ├── SamplePerson.model.js
│   │   ├── SamplePet.model.js
│   │   ├── sample.script.js
│   │   ├── sample.seed.js
│   │   ├── sample.unit.test.js
│   │   ├── sample.integration.test.js
│   │   └── utils.js
│   └── user
│       └── router.js
└── test
    └── integration.js
```

- `app/common/` : contains shared configurations and utilities
- `app/data/` : contains shared data models
- `app/module/<MODULE>` contains data models, routes, jobs, tests, ... for module
- `app/test/` contains test utils

## Components

This application consists of th following components:

### Application Core (`app-core`)

A singular central component for initialisation and coordination.

- should run in a single instance

### Application API (`app-api`)

A scalable components for running API

- able to run on multiple instances behind load balancer

### Application Job (`app-job`)

A scalable components for running jobs

- able to run on multiple instances behind load balancer

### Application Console (`app-console`)

A console to access and communicate with other application components

## Data (DAL/ORM)

Data is managed by [waterline](http://waterlinejs.org/).

- data models are defined in `*.model.js` files within their respective modules or under `app/data`
- every reference field must be prefixed with `_`

**References**

- [waterline](http://waterlinejs.org/)
- [waterline' repository](https://github.com/balderdashy/waterline)
- [Waterline Docs](https://sailsjs.com/documentation/concepts/models-and-orm)
- [Waterline Reference](https://sailsjs.com/documentation/reference/waterline-orm)
- [sails-mongo ](https://github.com/balderdashy/sails-mongo)
- [sails-redis](https://github.com/balderdashy/sails-redis)

## Jobs

...

## Testing

Both unit and integration testing use [Jest](https://jestjs.io/).

- unit tests are defined in `*.unit.test.js` files within their respective modules
- integration tests are defined in `*.integration.test.js` files within their respective modules

**References**

- [Jest](https://jestjs.io/)
