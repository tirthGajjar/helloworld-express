'use strict';

const graphql = require('graphql');

const Task = require('./Task.model');

module.exports = function defineGraphQLQueries() {
  return {
    MyTasks: {
      description: 'fetch my tasks',
      get type() {
        return new graphql.GraphQLList(Task.collection.graphql.type);
      },
      async resolve(parent, args, req) {
        const data = await Task.collection.find().where({
          _owner: req.user.id,
        });

        return data ? data.map((item) => item.toJSON()) : [];
      },
    },
  };
};
