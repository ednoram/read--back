import {
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLObjectType,
} from "graphql";

export const ArticleType = new GraphQLObjectType({
  name: "ArticleType",
  fields: {
    _id: { type: GraphQLString },
    body: { type: GraphQLString },
    title: { type: GraphQLString },
    userEmail: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});

export const ArticlesType = new GraphQLObjectType({
  name: "ArticlesType",
  fields: {
    totalCount: { type: GraphQLInt },
    articles: { type: new GraphQLList(ArticleType) },
  },
});
