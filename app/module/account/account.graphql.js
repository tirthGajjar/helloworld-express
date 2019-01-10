'use strict';

const graphql = require('graphql');

const User = require('../auth/User.model');

const UserAccount = new graphql.GraphQLObjectType({
  name: 'UserAccount',
  fields: () => ({
    ...User.collection.graphql.fields,
    role: { type: graphql.GraphQLString },
    email: { type: graphql.GraphQLString },
  }),
});

module.exports = function defineGraphQLQueries() {
  return {
    my_account: {
      description: 'fetch account',
      get type() {
        return UserAccount;
      },
      async resolve(parent, args, req) {
        return {
          role: req.user.role,
          email: req.user.email,
          ...req.user.toJSON(),
        };
      },
    },
  };
};
