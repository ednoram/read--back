import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { GraphQLNonNull, GraphQLString } from "graphql";

import { StringArgsType } from "@types";
import { ResetPasswordToken, User } from "@models";
import { SuccessType } from "@schema/globalTypes";
import { hashPassword, mailTransporter } from "@utils";
import { CLIENT_URL, MAIL_SENDER_EMAIL } from "@config";

export const sendResetPasswordEmail = {
  type: SuccessType,
  args: {
    userEmail: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { userEmail }: StringArgsType
  ): Promise<{ success: boolean }> => {
    const foundToken = await ResetPasswordToken.findOne({ userEmail });

    if (foundToken) {
      await ResetPasswordToken.findOneAndDelete({ userEmail });
    }

    const token = nanoid();

    const hashedToken = await hashPassword(token);

    const newToken = new ResetPasswordToken({ userEmail, token: hashedToken });

    await newToken.save();

    const linkHref = `${CLIENT_URL}/reset-password/${userEmail}/${token}`;

    const mailSubject = "Reset password - Read";
    const mailHtml = `
        <h1>Read - Reset password</h1>
        <p><a href="${linkHref}">Click here</a> to reset your password.</p>
      `;

    const mailOptions = {
      from: `"Read" ${MAIL_SENDER_EMAIL}`,
      to: userEmail,
      subject: mailSubject,
      html: mailHtml,
    };

    await mailTransporter.sendMail(mailOptions);

    return { success: true };
  },
};

export const resetPassword = {
  type: SuccessType,
  args: {
    token: { type: GraphQLNonNull(GraphQLString) },
    userEmail: { type: GraphQLNonNull(GraphQLString) },
    newPassword: { type: GraphQLNonNull(GraphQLString) },
    passwordConfirmation: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { token, userEmail, newPassword, passwordConfirmation }: StringArgsType
  ): Promise<{ success: boolean }> => {
    const foundUser = await User.findOne({ email: userEmail });

    if (!foundUser) {
      throw new Error("User with this email doesn't exist");
    }

    const foundToken = await ResetPasswordToken.findOne({ userEmail });

    if (!foundToken) {
      throw new Error("Token not found");
    }

    const tokenIsMatching = await bcrypt.compare(token, foundToken.token);

    if (!tokenIsMatching) {
      throw new Error("Token is invalid");
    }

    if (newPassword !== passwordConfirmation) {
      throw new Error("Passwords do not match");
    }

    const hashedPassword = await hashPassword(newPassword);

    await User.findOneAndUpdate(
      { email: userEmail },
      { $set: { password: hashedPassword } }
    );

    await ResetPasswordToken.findOneAndDelete({ userEmail });

    return { success: true };
  },
};
