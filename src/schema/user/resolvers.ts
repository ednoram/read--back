import { GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import { Request } from "express";
import bcrypt from "bcrypt";

import { User } from "@models";
import { IUser, ArgsType } from "@types";
import { TOKEN_COOKIE_OPTIONS } from "@config";
import { hashPassword, signJWT } from "@utils";
import { SuccessType } from "@schema/globalTypes";

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
  resolve: async (_: undefined, { email }: ArgsType): Promise<IUser> => {
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
    { name, email, password, passwordConfirmation }: ArgsType
  ): Promise<IUser> => {
    if (password.length < 8 || password.length > 16) {
      throw new Error("Password must contain 8-16 characters.");
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
    { email, password }: ArgsType,
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
