import {
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLObjectType,
} from "graphql";

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

export const UsersType = new GraphQLObjectType({
  name: "UsersType",
  fields: {
    totalCount: { type: GraphQLInt },
    users: { type: new GraphQLList(UserType) },
  },
});

export const LoginType = new GraphQLObjectType({
  name: "LoginType",
  fields: {
    user: { type: UserType },
    token: { type: GraphQLString },
  },
});
