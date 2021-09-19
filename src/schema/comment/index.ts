import { Request } from "express";
import { GraphQLInt, GraphQLString, GraphQLNonNull } from "graphql";

import { Comment, Article } from "@models";
import { IComment, StringArgsType } from "@types";

import { CommentType, CommentsType } from "./types";

export const comments = {
  type: CommentsType,
  args: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
    articleId: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { articleId, limit, offset }: { [argName: string]: string | number }
  ): Promise<{ comments: IComment[]; totalCount: number }> => {
    const comments: IComment[] = await Comment.find({ articleId });

    const sortedComments = comments.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const filteredComments =
      limit !== undefined
        ? sortedComments.slice(
            Number(offset || 0),
            Number(offset || 0) + Number(limit)
          )
        : sortedComments;

    return {
      comments: filteredComments,
      totalCount: comments.length,
    };
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

    const processedText = text.trim()[0].toUpperCase() + text.trim().slice(1);

    if (processedText === "") {
      throw new Error("Comment can not be empty");
    }

    if (processedText.length > 800) {
      throw new Error("Comment is too long");
    }

    const foundArticle = await Article.findOne({ _id: articleId });

    if (!foundArticle) {
      throw new Error("Article not found");
    }

    const foundComments = await Comment.find({
      articleId,
      userEmail: user.email,
    });

    if (foundComments.length > 10) {
      throw new Error("You can not have more than 10 comments on 1 article");
    }

    const comment = new Comment({
      articleId,
      text: processedText,
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

    const processedText = text.trim()[0].toUpperCase() + text.trim().slice(1);

    if (processedText === "") {
      throw new Error("Comment can not be empty");
    }

    if (processedText.length > 800) {
      throw new Error("Comment is too long");
    }

    return await Comment.findOneAndUpdate(
      { _id },
      {
        $set: {
          text: processedText,
        },
      },
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
