'use strict';

const graphql = require('graphql');

const User = require('../auth/User.model');

const UserAccount = new graphql.GraphQLObjectType({
  name: 'UserAccount',
  fields: () => ({
    ...User.collection.graphql.fields,
    role: { type: graphql.GraphQLString },
    email: { type: graphql.GraphQLString },
    email_verified: { type: graphql.GraphQLBoolean },
  }),
});

module.exports = () => ({
  queries: {
    account: {
      description: 'fetch account',
      get type() {
        return UserAccount;
      },
      async resolve(parent, args, req) {
        return User.collection.toAccount(req.user);
      },
    },
  },
});
