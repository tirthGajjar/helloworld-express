'use strict';

function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^[^a-z0-9]+/g, '')
    .replace(/[^a-z0-9]+$/g, '');
}

module.exports = {
  slugify,
};
