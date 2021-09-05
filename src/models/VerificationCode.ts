import { Schema, model } from "mongoose";

const VerificationCode = new Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },
    code: {
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
    collection: "verification_codes",
  }
);

export default model("VerificationCode", VerificationCode);
