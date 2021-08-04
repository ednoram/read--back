import { GraphQLSchema, GraphQLObjectType } from "graphql";

import {
  article,
  articles,
  postArticle,
  deleteArticle,
  updateArticle,
} from "./article";
import { user, users, register, login, logout } from "./user";

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    user,
    users,
    article,
    articles,
  },
});

const RootMutation = new GraphQLObjectType({
  name: "RootMutation",
  fields: {
    login,
    logout,
    register,
    postArticle,
    updateArticle,
    deleteArticle,
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

export default schema;
