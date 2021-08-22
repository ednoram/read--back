import { GraphQLObjectType, GraphQLString } from "graphql";

export const CommentType = new GraphQLObjectType({
  name: "CommentType",
  fields: {
    _id: { type: GraphQLString },
    text: { type: GraphQLString },
    userEmail: { type: GraphQLString },
    articleId: { type: GraphQLString },
  },
});
