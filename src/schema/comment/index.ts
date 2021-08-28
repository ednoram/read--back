import { Request } from "express";
import { GraphQLNonNull, GraphQLString, GraphQLList } from "graphql";

import { Comment, Article } from "@models";
import { IComment, StringArgsType } from "@types";

import { CommentType } from "./types";

export const comments = {
  type: new GraphQLList(CommentType),
  args: {
    articleId: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { articleId }: StringArgsType
  ): Promise<IComment[]> => {
    return await Comment.find({ articleId });
  },
};

export const comment = {
  type: CommentType,
  args: {
    _id: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { _id }: StringArgsType
  ): Promise<IComment[]> => {
    return await Comment.findOne({ _id });
  },
};

export const postComment = {
  type: CommentType,
  args: {
    text: { type: GraphQLNonNull(GraphQLString) },
    articleId: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { articleId, text }: StringArgsType,
    context: Request
  ): Promise<IComment> => {
    const { user } = context;

    if (!user) {
      throw new Error("Not authenticated");
    }

    if (text === "") {
      throw new Error("Comment can not be empty");
    }

    if (text.length > 800) {
      throw new Error("Comment is too long");
    }

    const foundArticle = await Article.findOne({ _id: articleId });

    if (!foundArticle) {
      throw new Error("Article not found");
    }

    const comment = new Comment({
      articleId,
      text: text.trim(),
      userEmail: user.email,
    });

    return await comment.save();
  },
};

export const updateComment = {
  type: CommentType,
  args: {
    _id: { type: GraphQLNonNull(GraphQLString) },
    text: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { _id, text }: StringArgsType,
    context: Request
  ): Promise<IComment> => {
    const { user } = context;

    if (!user) {
      throw new Error("Not authenticated");
    }

    const foundComment = await Comment.findOne({ _id });

    if (!foundComment) {
      throw new Error("Comment not found");
    }

    if (foundComment.userEmail !== user.email) {
      throw new Error("Comment does not belong to user");
    }

    if (text === "") {
      throw new Error("Comment can not be empty");
    }

    if (text.length > 800) {
      throw new Error("Comment is too long");
    }

    return await Comment.findOneAndUpdate(
      { _id },
      { $set: { text: text.trim() } },
      { returnOriginal: false }
    );
  },
};

export const deleteComment = {
  type: CommentType,
  args: {
    _id: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { _id }: StringArgsType,
    context: Request
  ): Promise<IComment> => {
    const { user } = context;

    if (!user) {
      throw new Error("Not authenticated");
    }

    const foundComment = await Comment.findOne({ _id });

    if (!foundComment) {
      throw new Error("Comment not found");
    }

    if (foundComment.userEmail !== user.email) {
      throw new Error("Comment does not belong to user");
    }

    return await Comment.findOneAndDelete({ _id });
  },
};
