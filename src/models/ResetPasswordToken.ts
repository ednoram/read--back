import { Schema, model } from "mongoose";

const ResetPasswordToken = new Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      expires: 3600,
      default: Date.now,
    },
  },
  {
    collection: "reset_password_tokens",
  }
);

export default model("ResetPasswordToken", ResetPasswordToken);
