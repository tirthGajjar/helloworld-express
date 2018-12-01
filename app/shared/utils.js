'use strict';

function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z]+/g, '-');
}

function getRandomArrayItem(array) {
  return array[Math.round(Math.random() * (array.length - 1))];
}

function getRandomArrayItemSet(array, count) {
  count = count || 1 + Math.round(Math.random() * (array.length - 2));
  const result = [];
  for (let i = 0; i < count; i++) {
    const item = array[Math.round(Math.random() * (array.length - 1))];
    if (!result.includes(item)) {
      result.push(item);
    }
  }
  return result;
}

module.exports = {
  slugify,
  getRandomArrayItem,
  getRandomArrayItemSet,
};
