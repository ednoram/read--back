import { Request } from "express";
import { GraphQLNonNull, GraphQLString, GraphQLList } from "graphql";

import { processArticlesData } from "@utils";
import { SavedArticle, Article } from "@models";
import { SuccessType } from "@schema/globalTypes";
import { IArticle, StringArgsType } from "@types";

import { ArticleType } from "@schema/article/types";

export const savedArticles = {
  type: new GraphQLList(ArticleType),
  resolve: async (
    _: undefined,
    __: unknown,
    context: Request
  ): Promise<IArticle[]> => {
    const { user } = context;

    if (!user) {
      throw new Error("Not authenticated");
    }

    const savedArticlesData = await SavedArticle.find({
      userEmail: user.email,
    });

    const savedArticleIds = savedArticlesData.map(
      ({ articleId }: { articleId: string }) => articleId
    );

    const savedArticles = await Article.find({ _id: { $in: savedArticleIds } });

    return processArticlesData(savedArticles);
  },
};

export const saveArticle = {
  type: SuccessType,
  args: {
    articleId: { type: GraphQLNonNull(GraphQLString) },
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

    const foundArticle = await Article.findOne({ _id: articleId });

    if (!foundArticle) {
      throw new Error("Article does not exist");
    }

    const foundSavedArticle = await SavedArticle.findOne({
      articleId,
      userEmail: user.email,
    });

    if (foundSavedArticle) {
      throw new Error("Article is already saved");
    }

    const newSavedArticle = new SavedArticle({
      articleId,
      userEmail: user.email,
    });

    await newSavedArticle.save();

    return { success: true };
  },
};

export const removeSavedArticle = {
  type: SuccessType,
  args: {
    articleId: { type: GraphQLNonNull(GraphQLString) },
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

    await SavedArticle.findOneAndDelete({ userEmail: user.email, articleId });

    return { success: true };
  },
};
