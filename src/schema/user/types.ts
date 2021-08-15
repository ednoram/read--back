import { GraphQLString, GraphQLObjectType } from "graphql";

export const UserType = new GraphQLObjectType({
  name: "UserType",
  fields: {
    _id: { type: GraphQLString },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    about: { type: GraphQLString },
    createdAt: { type: GraphQLString },
  },
});
