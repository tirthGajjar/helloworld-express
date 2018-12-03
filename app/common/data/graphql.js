'use strict';

/** @module Data */

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const graphql = require('graphql');

const DataWaterline = require('./waterline');

let schema = null;

const RawType = new graphql.GraphQLScalarType({
  name: 'Raw',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral(ast) {
    return ast.value;
  },
});

const JSONType = new graphql.GraphQLScalarType({
  name: 'JSON',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral(ast) {
    return ast.value;
  },
});

function getGraphqlFieldFromWaterlineAttribute(collectionName, attributeName, attributeConfig) {
  const result = {};

  if (attributeConfig.type === 'string') {
    result.type = graphql.GraphQLString;
  } else if (attributeConfig.type === 'number') {
    result.type = graphql.GraphQLFloat;
  } else if (attributeConfig.type === 'boolean') {
    result.type = graphql.GraphQLBoolean;
  } else if (attributeConfig.type === 'json') {
    result.type = JSONType;
  } else if (attributeConfig.type === 'ref') {
    result.type = RawType;
  } else {
    return;
  }

  // if (attributeConfig.validations && attributeConfig.validations.isIn) {
  //   result.type = new graphql.GraphQLEnumType({
  //     name: attributeName,
  //     values: attributeConfig.validations.isIn.reduce((acc, item) => ({ ...acc, [item]: { value: item } }), {}),
  //   });
  // }

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

    const collectionName = collection.tableName;

    const collectionFields = Object.entries(collection.attributes).reduce((acc, [attributeName, attributeConfig]) => {
      if (collection.attributes_to_strip_in_json.includes(attributeName)) {
        return acc;
      }

      let field;

      if (attributeName === collection.primaryKey) {
        field = {
          type: graphql.GraphQLID,
        };
      } else if (attributeConfig.model) {
        field = {
          get type() {
            return ontology.collections[attributeConfig.model].graphql.type;
          },
          async resolve(parent) {
            const result = await ontology.collections[attributeConfig.model].findOne(parent[attributeName]);
            return result ? result.toJSON() : null;
          },
        };
      } else if (attributeConfig.collection) {
        field = {
          get type() {
            return new graphql.GraphQLList(ontology.collections[attributeConfig.collection].graphql.type);
          },
          async resolve(parent, args) {
            const [targetCollection, throughCollection, attributes] = collection.association(attributeName);

            let ids = null;

            if (throughCollection) {
              const result = await throughCollection.find().where({
                [attributes.self]: parent.id,
              });
              ids = result.map((item) => item[attributes.target]);
            }

            let result = [];

            if (ids) {
              result = await targetCollection.find(ids);
            } else {
              result = await targetCollection.find().where({
                [attributes.self]: parent.id,
              });
            }

            return result ? result.map((item) => item.toJSON()) : [];
          },
        };
      } else {
        field = getGraphqlFieldFromWaterlineAttribute(collectionName, attributeName, attributeConfig);
      }

      if (!field) {
        return acc;
      }

      return {
        ...acc,
        [attributeName]: field,
      };
    }, {});

    const CollectionType = new graphql.GraphQLObjectType({
      name: collectionName,
      fields: collectionFields,
    });

    const collectionArgs = Object.entries(collectionFields).reduce((acc, [key, value]) => {
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
      name: collectionName,
      args: collectionArgs,
      fields: collectionFields,
      type: CollectionType,
    };

    const indexQuery = {
      name: `${collectionName}Index`,
      type: new graphql.GraphQLList(CollectionType),
      args: {
        ...collectionArgs,
      },
      async resolve(parent, args) {
        const result = await collection.find(args);
        return result ? result.map((item) => item.toJSON()) : [];
      },
    };

    const itemQuery = {
      name: collectionName,
      type: CollectionType,
      args: {
        [collection.primaryKey]: { type: graphql.GraphQLID },
      },
      async resolve(parent, args) {
        const result = await collection.findOne(args);
        return result ? result.toJSON() : null;
      },
    };

    if (collectionName === 'store') {
      queries[itemQuery.name] = itemQuery;
    } else {
      queries[indexQuery.name] = indexQuery;
      queries[itemQuery.name] = itemQuery;
    }

    if (collection.defineGraphQLQueries) {
      Object.assign(
        queries,
        collection.defineGraphQLQueries(graphql, collectionName, collectionFields, CollectionType),
      );
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

// @TODO allow filtering by many-to-many association in index queries
