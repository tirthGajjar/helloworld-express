'use strict';

const User = require('../auth/User.model');

module.exports = () => ({
  queries: {
    self_profile: {
      description: 'fetch user profile',
      get type() {
        return User.collection.graphql.custom_types.UserRecord;
      },
      async resolve(parent, args, req) {
        return User.collection.toUserRecord(req.user);
      },
    },
  },
});
