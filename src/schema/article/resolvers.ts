import { Request } from "express";
import { GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";

import { Article } from "@models";
import { processTitle } from "@utils";
import { SuccessType } from "@schema/globalTypes";
import { StringArgsType, IArticle } from "@types";

import { ArticleType } from "./types";

export const articles = {
  type: new GraphQLList(ArticleType),
  args: {
    userEmail: { type: GraphQLString },
  },
  resolve: async (
    _: undefined,
    { userEmail }: StringArgsType
  ): Promise<IArticle[]> => {
    return Article.find(userEmail ? { userEmail } : {});
  },
};

export const article = {
  type: ArticleType,
  args: {
    _id: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (_: undefined, { _id }: StringArgsType): Promise<IArticle> => {
    return await Article.findOne({ _id });
  },
};

export const postArticle = {
  type: ArticleType,
  args: {
    body: { type: GraphQLNonNull(GraphQLString) },
    title: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { body, title }: StringArgsType,
    context: Request
  ): Promise<IArticle> => {
    const { user } = context;

    if (!user) throw new Error("Not authenticated");
    if (!title) throw new Error("Title is required");
    if (title.length > 50) throw new Error("Title is too long");
    if (!body) throw new Error("Body is required");

    const newArticle = new Article({
      userEmail: user.email,
      title: processTitle(title),
      body: body[0].toUpperCase() + body.slice(1),
    });

    return await newArticle.save();
  },
};

export const updateArticle = {
  type: ArticleType,
  args: {
    body: { type: GraphQLString },
    title: { type: GraphQLString },
    _id: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { _id, title, body }: StringArgsType,
    context: Request
  ): Promise<IArticle> => {
    const { user } = context;

    if (!user) throw new Error("Not authenticated");

    const article = await Article.findOne({ _id });

    if (!article) throw new Error("Article was not found");

    if (user.email !== article.userEmail) {
      throw new Error("Article does not belong to user");
    }

    if (title === "") throw new Error("Title cannot be empty");
    if (title.length > 50) throw new Error("Title is too long");
    if (body === "") throw new Error("Body cannot be empty");

    return await Article.findOneAndUpdate(
      { _id },
      {
        $set: {
          title: processTitle(title) || article.title,
          body: body[0].toUpperCase() + body.slice(1) || article.body,
        },
      },
      { returnOriginal: false }
    );
  },
};

export const deleteArticle = {
  type: SuccessType,
  args: {
    _id: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { _id }: StringArgsType,
    context: Request
  ): Promise<{ success: boolean }> => {
    const { user } = context;

    if (!user) throw new Error("Not authenticated");

    const foundArticle = await Article.findOne({ _id });

    if (!foundArticle) throw new Error("Article was not found");

    await Article.findOneAndDelete({ _id });

    return { success: true };
  },
};
