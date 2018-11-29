'use strict';

/** @module Data */

const uuidv4 = require('uuid/v4');

/**
 * generates a token
 */

function generateToken() {
  return uuidv4();
}

module.exports = {
  generateToken,
};
