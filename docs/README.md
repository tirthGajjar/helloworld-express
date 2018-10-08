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

...

- data models are defined in `*.model.js` files within their respective modules or under `app/data`
- every reference field must be prefixed with `_`

## Testing

- unit tests are defined in `*.unit.test.js` files within their respective modules
- integration tests are defined in `*.integration.test.js` files within their respective modules
