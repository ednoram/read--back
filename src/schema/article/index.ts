import { Request } from "express";
import { GraphQLInt, GraphQLString, GraphQLNonNull } from "graphql";

import { SuccessType } from "@schema/globalTypes";
import { StringArgsType, IArticle } from "@types";
import { processTitle, processArticlesData } from "@utils";
import { Article, Comment, Like, SavedArticle } from "@models";

import { ArticleType, ArticlesType } from "./types";

export const articles = {
  type: ArticlesType,
  args: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
    userEmail: { type: GraphQLString },
    searchFilter: { type: GraphQLString },
  },
  resolve: async (
    _: undefined,
    {
      limit,
      offset,
      userEmail,
      searchFilter,
    }: { [argName: string]: string | number }
  ): Promise<{ totalCount: number; articles: IArticle[] }> => {
    const articles: IArticle[] = await Article.find(
      userEmail ? { userEmail } : {}
    );

    const processedSearchFilter = String(searchFilter)
      .trim()
      .replace(/\s\s+/g, " ")
      .toLowerCase();

    const filteredArticles = searchFilter
      ? articles.filter((article) =>
          article.title.toLocaleLowerCase().includes(processedSearchFilter)
        )
      : articles;

    const processedData = processArticlesData(filteredArticles);

    const returnedArticles =
      limit !== undefined
        ? processedData.slice(
            Number(offset || 0),
            Number(offset || 0) + Number(limit)
          )
        : processedData;

    return {
      articles: returnedArticles,
      totalCount: filteredArticles.length,
    };
  },
};

export const article = {
  type: ArticleType,
  args: {
    _id: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { _id }: StringArgsType,
    context: Request
  ): Promise<IArticle> => {
    const article = await Article.findOne({ _id });
    const likes = await Like.find({ articleId: _id });

    const { user } = context;

    const foundUserLike =
      user &&
      (await Like.findOne({
        articleId: _id,
        userEmail: user.email,
      }));

    const foundUserSavedArticle =
      user &&
      (await SavedArticle.findOne({
        articleId: _id,
        userEmail: user.email,
      }));

    const isLiked = user ? Boolean(foundUserLike) : null;
    const isSaved = user ? Boolean(foundUserSavedArticle) : null;

    return {
      ...article.toObject(),
      likesCount: likes.length,
      isLiked,
      isSaved,
    };
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
    if (title.length > 60) throw new Error("Title is too long");
    if (!body) throw new Error("Body is required");
    if (body.length > 20000) throw new Error("Body is too long");

    const newArticle = new Article({
      userEmail: user.email,
      title: processTitle(title),
      body: body.trim()[0].toUpperCase() + body.trim().slice(1),
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
    if (title.length > 60) throw new Error("Title is too long");
    if (body === "") throw new Error("Body cannot be empty");
    if (body.length > 20000) throw new Error("Body is too long");

    return await Article.findOneAndUpdate(
      { _id },
      {
        $set: {
          title: processTitle(title) || article.title,
          body:
            body.trim()[0].toUpperCase() + body.trim().slice(1) || article.body,
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

    await Comment.deleteMany({ articleId: _id });

    await SavedArticle.deleteMany({ articleId: _id });

    await Like.deleteMany({ articleId: _id });

    await Article.findOneAndDelete({ _id });

    return { success: true };
  },
};
