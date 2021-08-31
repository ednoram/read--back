import { Request } from "express";
import { GraphQLString } from "graphql";

import { Article, Like } from "@models";
import { StringArgsType } from "@types";
import { SuccessType } from "@schema/globalTypes";

export const likeArticle = {
  type: SuccessType,
  args: {
    articleId: { type: GraphQLString },
  },
  resolve: async (
    _: undefined,
    { articleId }: StringArgsType,
    context: Request
  ): Promise<{ success: boolean }> => {
    const { user } = context;

    if (!user) {
      throw new Error("Not authenticated");
    }

    const foundLike = await Like.findOne({ articleId, userEmail: user.email });

    if (foundLike) {
      throw new Error("Article is already liked");
    }

    const foundArticle = await Article.findOne({ _id: articleId });

    if (!foundArticle) {
      throw new Error("Article not found");
    }

    const newLike = new Like({ articleId, userEmail: user.email });

    await newLike.save();

    return { success: true };
  },
};

export const unlikeArticle = {
  type: SuccessType,
  args: {
    articleId: { type: GraphQLString },
  },
  resolve: async (
    _: undefined,
    { articleId }: StringArgsType,
    context: Request
  ): Promise<{ success: boolean }> => {
    const { user } = context;

    if (!user) {
      throw new Error("Not authenticated");
    }

    const foundLike = await Like.findOne({ articleId, userEmail: user.email });

    if (!foundLike) {
      throw new Error("Article is not liked");
    }

    await Like.findOneAndDelete({ articleId, userEmail: user.email });

    return { success: true };
  },
};
