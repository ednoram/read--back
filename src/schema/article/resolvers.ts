import { Request } from "express";
import { GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";

import { Article } from "@models";
import { processTitle } from "@utils";
import { SuccessType } from "@schema/globalTypes";
import { StringArgsType, IArticle } from "@types";

import { ArticleType } from "./types";

export const articles = {
  type: new GraphQLList(ArticleType),
  resolve: async (): Promise<IArticle[]> => await Article.find(),
};

export const article = {
  type: ArticleType,
  args: {
    _id: { type: GraphQLString },
  },
  resolve: async (_: undefined, { _id }: StringArgsType): Promise<IArticle> =>
    await Article.findOne({ _id }),
};

export const postArticle = {
  type: ArticleType,
  args: {
    body: { type: GraphQLString },
    title: { type: GraphQLString },
  },
  resolve: async (
    _: undefined,
    { body, title }: StringArgsType,
    context: Request
  ): Promise<IArticle> => {
    const { user } = context;

    if (!user) {
      throw new Error("Not authenticated");
    }

    const newArticle = new Article({
      body,
      userEmail: user.email,
      title: processTitle(title),
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

    return await Article.findOneAndUpdate(
      { _id },
      {
        $set: {
          body: body || article.body,
          title: processTitle(title) || article.title,
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
