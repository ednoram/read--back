import { Schema, model } from "mongoose";

const Article = new Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "articles",
  }
);

export default model("Article", Article);
