import { Schema, model } from "mongoose";

const SavedArticle = new Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },
    articleId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "saved_article",
  }
);

export default model("SavedArticle", SavedArticle);
