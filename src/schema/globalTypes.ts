import { GraphQLObjectType, GraphQLBoolean } from "graphql";

export const SuccessType = new GraphQLObjectType({
  name: "SuccessType",
  fields: {
    success: { type: GraphQLBoolean },
  },
});
