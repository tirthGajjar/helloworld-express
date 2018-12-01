'use strict';

/** @module Data */

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const graphql = require('graphql');

const DataWaterline = require('./waterline');

let schema = null;

const JSONType = new graphql.GraphQLScalarType({
  name: 'JSON',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral(ast) {
    return ast.value;
  },
});

function getGraphqlFieldFromWaterlineAttribute(config) {
  const result = {};

  if (config.type === 'string') {
    result.type = graphql.GraphQLString;
  } else if (config.type === 'number') {
    result.type = graphql.GraphQLFloat;
  } else if (config.type === 'boolean') {
    result.type = graphql.GraphQLBoolean;
  } else if (config.type === 'json') {
    result.type = JSONType;
  } else if (config.type === 'ref') {
    result.type = JSONType;
  } else {
    return;
  }

  return result;
}

function getGraphQLSchemaFromWaterline(ontology) {
  const queries = {};

  Object.values(ontology.collections).forEach((collection) => {
    if (collection.junctionTable) {
      return;
    }

    if (collection.identity === 'archive') {
      return;
    }

    const name = collection.tableName;

    const fields = Object.entries(collection.attributes).reduce((acc, [attribute, config]) => {
      if (collection.attributes_to_strip_in_json.includes(attribute)) {
        return acc;
      }

      let field;

      if (attribute === collection.primaryKey) {
        field = {
          type: graphql.GraphQLID,
        };
      } else if (config.model) {
        field = {
          get type() {
            return ontology.collections[config.model].graphql.type;
          },
          async resolve(parent) {
            const result = await ontology.collections[config.model].findOne(parent[attribute]);
            return result ? result.toJSON() : null;
          },
        };
      } else if (config.collection) {
        // field = {
        //   type: new graphql.GraphQLList(graphql.GraphQLID),
        // };

        field = {
          get type() {
            return new graphql.GraphQLList(ontology.collections[config.collection].graphql.type);
          },
          async resolve(parent, args) {
            const [targetCollection, throughCollection, attributes] = collection.association(attribute);

            let ids = null;

            if (throughCollection) {
              const result = await throughCollection.find().where({
                [attributes.self]: parent.id,
                ...args,
              });
              ids = result.map((item) => item[attributes.target]);
            }

            let result = [];

            if (ids) {
              result = await targetCollection.find(ids);
            } else {
              result = await targetCollection.find().where({
                [attributes.self]: parent.id,
                ...args,
              });
            }

            return result ? result.map((item) => item.toJSON()) : [];
          },
        };
      } else {
        field = getGraphqlFieldFromWaterlineAttribute(config);
      }

      if (!field) {
        return acc;
      }

      return {
        ...acc,
        [attribute]: field,
      };
    }, {});

    const CollectionType = new graphql.GraphQLObjectType({
      name,
      fields,
    });

    const args = Object.entries(fields).reduce((acc, [key, value]) => {
      if (collection.attributes[key].collection) {
        return acc;
      }
      return {
        ...acc,
        [key]: value.resolve
          ? {
            type: graphql.GraphQLID,
          }
          : value,
      };
    }, {});

    collection.graphql = {
      name,
      args,
      fields,
      type: CollectionType,
    };

    const indexQuery = {
      name: `${name}Index`,
      type: new graphql.GraphQLList(CollectionType),
      args: {
        ...args,
      },
      async resolve(parent, args) {
        const result = await collection.find(args);
        return result ? result.map((item) => item.toJSON()) : [];
      },
    };

    const itemQuery = {
      name,
      type: CollectionType,
      args: {
        [collection.primaryKey]: { type: graphql.GraphQLID },
      },
      async resolve(parent, args) {
        const result = await collection.findOne().where(args);
        return result ? result.toJSON() : null;
      },
    };

    if (name === 'store') {
      queries[itemQuery.name] = itemQuery;
    } else {
      queries[indexQuery.name] = indexQuery;
      queries[itemQuery.name] = itemQuery;
    }

    if (collection.defineGraphQLQueries) {
      Object.assign(queries, collection.defineGraphQLQueries(graphql, name, fields, CollectionType));
    }
  });

  const Root = new graphql.GraphQLObjectType({
    name: 'Root',
    description: 'Schema Root Query',
    fields: () => queries,
  });

  return new graphql.GraphQLSchema({
    query: Root,
  });
}

async function setup() {
  Logger.info('setup ...');

  schema = getGraphQLSchemaFromWaterline(DataWaterline.ontology);

  module.exports.schema = schema;

  Logger.info('setup done');

  return schema;
}

async function teardown() {
  Logger.info('teardown ...');

  module.exports.schema = null;

  Logger.info('teardown done');
}

module.exports = {
  setup,
  teardown,
  schema,
};
