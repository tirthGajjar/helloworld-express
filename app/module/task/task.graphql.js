'use strict';

const graphql = require('graphql');

const Task = require('./Task.model');

module.exports = () => ({
  queries: {
    my_tasks: {
      description: 'fetch my tasks',
      get type() {
        return new graphql.GraphQLList(Task.collection.graphql.type);
      },
      async resolve(parent, args, req) {
        return await Task.collection.find().where({
          _owner: req.user.id,
        });
      },
    },
  },
});
