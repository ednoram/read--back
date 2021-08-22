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
  comments,
  comment,
  postComment,
  updateComment,
  deleteComment,
} from "./comment";
import {
  article,
  articles,
  postArticle,
  deleteArticle,
  updateArticle,
} from "./article";
import { savedArticles, saveArticle, removeSavedArticle } from "./savedArticle";

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    user,
    users,
    article,
    comment,
    comments,
    articles,
    savedArticles,
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
    saveArticle,
    postComment,
    updateComment,
    deleteComment,
    updateArticle,
    deleteArticle,
    removeSavedArticle,
    changeUserPassword,
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

export default schema;
