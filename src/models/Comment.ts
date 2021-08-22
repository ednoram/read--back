import { Schema, model } from "mongoose";

const Comment = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    articleId: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "comments",
  }
);

export default model("Comment", Comment);
