import { GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import { Request } from "express";
import bcrypt from "bcrypt";

import { User } from "@models";
import { TOKEN_COOKIE_OPTIONS } from "@config";
import { IUser, StringArgsType } from "@types";
import { SuccessType } from "@schema/globalTypes";
import { hashPassword, signJWT, processTitle } from "@utils";

import { UserType } from "./types";

export const users = {
  name: "users",
  type: new GraphQLList(UserType),
  resolve: async (): Promise<IUser[]> => {
    return await User.find();
  },
};

export const user = {
  name: "user",
  type: UserType,
  args: {
    email: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (_: undefined, { email }: StringArgsType): Promise<IUser> => {
    return await User.findOne({ email });
  },
};

export const register = {
  type: UserType,
  args: {
    name: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
    password: { type: GraphQLNonNull(GraphQLString) },
    passwordConfirmation: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { name, email, password, passwordConfirmation }: StringArgsType
  ): Promise<IUser> => {
    if (password.length < 8 || password.length > 16) {
      throw new Error("Password must be 8-16 characters long.");
    }

    if (password !== passwordConfirmation) {
      throw new Error("Password and password confirmation do not match.");
    }

    const foundUser = await User.findOne({ email });

    if (foundUser) {
      throw new Error("User with this email address already exists.");
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({ name, email, password: hashedPassword });
    const response = await newUser.save();

    return response;
  },
};

export const login = {
  type: UserType,
  args: {
    email: { type: GraphQLNonNull(GraphQLString) },
    password: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { email, password }: StringArgsType,
    { res }: Request
  ): Promise<IUser> => {
    if (!res) {
      throw new Error("Something went wrong.");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User was not found.");
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    if (!passwordIsCorrect) {
      throw new Error("Password is wrong.");
    }

    const token = signJWT(user._id, email, "24h");

    res.cookie("token", token, TOKEN_COOKIE_OPTIONS);

    return user;
  },
};

export const logout = {
  type: SuccessType,
  resolve: (
    _: undefined,
    __: unknown,
    { res }: Request
  ): { success: boolean } => {
    if (!res) {
      throw new Error("Something went wrong.");
    }

    res.clearCookie("token", TOKEN_COOKIE_OPTIONS);
    return { success: true };
  },
};

export const changeUserName = {
  type: UserType,
  args: {
    name: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { name }: StringArgsType,
    context: Request
  ): Promise<IUser> => {
    const { user } = context;

    if (!user) {
      throw new Error("Not authenticated.");
    }

    if (!name) {
      throw new Error("User name cannot be empty.");
    }

    return await User.findOneAndUpdate(
      { email: user.email },
      { $set: { name: processTitle(name) } },
      { returnOriginal: false }
    );
  },
};

export const changeUserPassword = {
  type: SuccessType,
  args: {
    newPassword: { type: GraphQLNonNull(GraphQLString) },
    currentPassword: { type: GraphQLNonNull(GraphQLString) },
    passwordConfirmation: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { newPassword, currentPassword, passwordConfirmation }: StringArgsType,
    context: Request
  ): Promise<{ success: boolean }> => {
    const { user } = context;

    if (!user) {
      throw new Error("Not authenticated.");
    }

    const passwordIsCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordIsCorrect) {
      throw new Error("Password is wrong.");
    }

    if (newPassword.length > 16 || newPassword.length < 8) {
      throw new Error("Password must be 8-16 characters long.");
    }

    if (newPassword !== passwordConfirmation) {
      throw new Error("Passwords to not match.");
    }

    const hashedPassword = await hashPassword(newPassword);

    await User.findOneAndUpdate(
      { email: user.email },
      { $set: { password: hashedPassword } }
    );

    return { success: true };
  },
};
