import {
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLObjectType,
} from "graphql";

export const CommentType = new GraphQLObjectType({
  name: "CommentType",
  fields: {
    _id: { type: GraphQLString },
    text: { type: GraphQLString },
    userEmail: { type: GraphQLString },
    articleId: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});

export const CommentsType = new GraphQLObjectType({
  name: "CommentsType",
  fields: {
    totalCount: { type: GraphQLInt },
    comments: { type: new GraphQLList(CommentType) },
  },
});
