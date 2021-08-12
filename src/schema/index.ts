import { GraphQLSchema, GraphQLObjectType } from "graphql";

import {
  user,
  users,
  login,
  logout,
  register,
  updateUser,
  loginWithToken,
  changeUserPassword,
} from "./user";
import {
  article,
  articles,
  postArticle,
  deleteArticle,
  updateArticle,
} from "./article";

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    user,
    users,
    article,
    articles,
    loginWithToken,
  },
});

const RootMutation = new GraphQLObjectType({
  name: "RootMutation",
  fields: {
    login,
    logout,
    register,
    updateUser,
    postArticle,
    updateArticle,
    deleteArticle,
    changeUserPassword,
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

export default schema;
