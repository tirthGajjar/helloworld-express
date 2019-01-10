'use strict';

/** @module Data */

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const glob = require('glob');
const path = require('path');

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
      collection.graphql_ignore = true;
    }

    if (collection.identity === 'archive') {
      collection.graphql_ignore = true;
    }

    collection.graphql_ignore = collection.graphql_ignore || false;

    if (collection.graphql_ignore === true) {
      return;
    }

    collection.graphql_options = {
      reference: true,
      count: true,
      index: true,
      item: true,
      ...(collection.graphql_options || {}),
    };
  });

  Object.values(ontology.collections).forEach((collection) => {
    if (collection.graphql_ignore === true) {
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
      } else if (attributeConfig.model && ontology.collections[attributeConfig.model].graphql_options.reference) {
        field = {
          get type() {
            return ontology.collections[attributeConfig.model].graphql.type;
          },
          async resolve(parent) {
            const data = await ontology.collections[attributeConfig.model].findOne(parent[attributeName]);
            return data ? data.toJSON() : null;
          },
        };
      } else if (
        attributeConfig.collection
        && ontology.collections[attributeConfig.collection].graphql_options.reference
      ) {
        field = {
          get type() {
            return new graphql.GraphQLList(ontology.collections[attributeConfig.collection].graphql.type);
          },
          async resolve(parent, args) {
            const [targetCollection, throughCollection, attributes] = collection.association(attributeName);

            let ids = null;

            if (throughCollection) {
              const data = await throughCollection.find().where({
                [attributes.self]: parent.id,
              });
              ids = data.map((item) => item[attributes.target]);
            }

            let data = [];

            if (ids) {
              data = await targetCollection.find(ids);
            } else {
              data = await targetCollection.find().where({
                [attributes.self]: parent.id,
              });
            }

            return data ? data.map((item) => item.toJSON()) : [];
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

    const FilterType = new graphql.GraphQLInputObjectType({
      name: `${collectionName}Filter`,
      fields: {
        ...collectionArgs,
      },
    });

    if (collection.graphql_options.count) {
      const query = collection.graphql_options.count === 'simple'
        ? {
          name: `${collectionName}Count`,
          description: `fetch ${collectionName} count`,
          type: graphql.GraphQLInt,
          async resolve(parent, args) {
            return await collection.count();
          },
        }
        : {
          name: `${collectionName}Count`,
          description: `fetch ${collectionName} count`,
          args: {
            filter: {
              type: FilterType,
            },
          },
          type: graphql.GraphQLInt,
          async resolve(parent, args) {
            return await collection.count().where(args.filter);
          },
        };

      queries[query.name] = query;
    }

    if (collection.graphql_options.index) {
      const query = collection.graphql_options.index === 'simple'
        ? {
          name: `${collectionName}Index`,
          description: `fetch ${collectionName} index`,
          type: new graphql.GraphQLList(CollectionType),
          async resolve(parent, args) {
            const data = await collection.find();
            return data ? data.map((item) => item.toJSON()) : [];
          },
        }
        : {
          name: `${collectionName}Index`,
          description: `fetch ${collectionName} index`,
          args: {
            filter: {
              type: FilterType,
            },
            offset: {
              type: graphql.GraphQLInt,
            },
            limit: {
              type: graphql.GraphQLInt,
            },
            sort: {
              type: graphql.GraphQLString,
            },
          },
          type: new graphql.GraphQLList(CollectionType),
          async resolve(parent, args) {
            const data = await collection
              .find()
              .where(args.filter)
              .skip(args.offset)
              .limit(args.limit)
              .sort(args.sort);
            return data ? data.map((item) => item.toJSON()) : [];
          },
        };

      queries[query.name] = query;
    }

    if (collection.graphql_options.item) {
      const query = {
        name: collectionName,
        description: `fetch ${collectionName} item`,
        args: {
          [collection.primaryKey]: { type: graphql.GraphQLID },
        },
        type: CollectionType,
        async resolve(parent, args) {
          const data = await collection.findOne(args);
          return data ? data.toJSON() : null;
        },
      };

      queries[query.name] = query;
    }
  });

  glob.sync('app/**/*.graphql.js').forEach((filename) => {
    Logger.info('loading', filename);
    const defineGraphQLQueries = require(path.resolve(filename));
    Object.assign(queries, defineGraphQLQueries());
  });

  const Root = new graphql.GraphQLObjectType({
    name: 'Root',
    description: 'Root query',
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
