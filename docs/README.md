# Overview

This application is designed with robustness, modularity and salability in mind.

## Folder Structure

```
app
├── common
├── lib
├── data
├── job
├── module
│   └── sample
│       ├── router.js
│       ├── SamplePerson.model.js
│       ├── SamplePet.model.js
│       ├── sample_task.job.js
│       ├── sample.script.js
│       ├── sample.seed.js
│       ├── sample.unit.test.js
│       ├── sample.integration.test.js
│       └── utils.js
└── test
    └── setup.js
```

- `app/common/` : contains shared configurations and utilities
- `app/data/` : contains shared data models
- `app/job/` : contains shared job
- `app/module/<MODULE>` contains data models, routes, jobs, tests, ... for module
- `app/test/` contains test utils and global tests

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

- a data models is defined in `*.model.js` file within a module or under `app/data`
- every reference field must be prefixed with `_`

**References**

- [waterline](http://waterlinejs.org/)
- [waterline' repository](https://github.com/balderdashy/waterline)
- [Waterline Docs](https://sailsjs.com/documentation/concepts/models-and-orm)
- [Waterline Reference](https://sailsjs.com/documentation/reference/waterline-orm)
- [sails-mongo ](https://github.com/balderdashy/sails-mongo)
- [sails-redis](https://github.com/balderdashy/sails-redis)

## Jobs / Queues

Jobs are managed by [Bull](https://github.com/OptimalBits/bull)

- a job is defined in a `*.job.js` file within a module or under `app/job`
- a job runs within `app-job` component
- a job is initiated from any components using `Job.queues.JOB_NAME.add({ /* job payload */ })`

**References**

- [Bull](https://github.com/OptimalBits/bull)

## Testing

Both unit and integration testing use [Jest](https://jestjs.io/).

- a unit test suite id defined in a `*.unit.test.js` file within a module
- an integration test suite id defined in a `*.integration.test.js` file within a module

**References**

- [Jest](https://jestjs.io/)
