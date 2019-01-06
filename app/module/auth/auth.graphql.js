'use strict';

const graphql = require('graphql');

const User = require('./User.model');

module.exports = function defineGraphQLQueries() {
  return {
    my_account: {
      description: 'fetch account',
      get type() {
        return User.collection.graphql.type;
      },
      async resolve(parent, args, req) {
        return req.user.toJSON ? req.user.toJSON() : req.user;
      },
    },
  };
};
