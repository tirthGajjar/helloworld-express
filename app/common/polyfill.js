'use strict';

// require('formdata-polyfill');

global.self = global;

require('whatwg-fetch');

delete global.self;
