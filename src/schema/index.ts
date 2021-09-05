import { GraphQLSchema, GraphQLObjectType } from "graphql";

import {
  user,
  users,
  login,
  logout,
  register,
  updateUser,
  verifyAccount,
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
import { likeArticle, unlikeArticle } from "./like";
import { sendVerificationCode } from "./verificationCode";
import { sendResetPasswordEmail, resetPassword } from "./resetPassword";
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
    likeArticle,
    postComment,
    resetPassword,
    verifyAccount,
    unlikeArticle,
    updateComment,
    deleteComment,
    updateArticle,
    deleteArticle,
    removeSavedArticle,
    changeUserPassword,
    sendVerificationCode,
    sendResetPasswordEmail,
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

export default schema;
