'use strict';

const graphql = require('graphql');

const Post = require('./Post.model');

module.exports = () => ({
  queries: {
    own_posts: {
      description: 'fetch own posts',
      get type() {
        return new graphql.GraphQLList(Post.collection.graphql.type);
      },
      resolve(parent, args, req) {
        return Post.collection.find().where({
          _owner: req.user.id,
        });
      },
    },
  },
});
