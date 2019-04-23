'use strict';

const graphql = require('graphql');

const Raw = new graphql.GraphQLScalarType({
  name: 'Raw',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral(ast) {
    return ast.value;
  },
});

const JSON = new graphql.GraphQLScalarType({
  name: 'JSON',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral(ast) {
    return ast.value;
  },
});

module.exports = {
  Raw,
  JSON,
};
