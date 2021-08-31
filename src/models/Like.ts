import { Schema, model } from "mongoose";

const Like = new Schema(
  {
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
    collection: "likes",
  }
);

export default model("Like", Like);
