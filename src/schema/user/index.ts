import bcrypt from "bcrypt";
import { Request } from "express";
import { GraphQLInt, GraphQLString, GraphQLNonNull } from "graphql";

import { IUser, StringArgsType } from "@types";
import { User, VerificationCode } from "@models";
import { SuccessType } from "@schema/globalTypes";
import { hashPassword, sendVerificationEmail, signJWT } from "@utils";

import { UserType, UsersType, LoginType } from "./types";

export const users = {
  type: UsersType,
  args: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
    searchFilter: { type: GraphQLString },
  },
  resolve: async (
    _: undefined,
    { searchFilter, limit, offset }: { [argName: string]: string | number }
  ): Promise<{ totalCount: number; users: IUser[] }> => {
    const allUsers: IUser[] = await User.find({ isVerified: true });

    const processedSearchFilter = searchFilter
      ? String(searchFilter).trim().replace(/\s\s+/g, " ").toLowerCase()
      : "";

    const filteredUsers = searchFilter
      ? allUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(processedSearchFilter) ||
            user.email.toLowerCase().includes(processedSearchFilter)
        )
      : allUsers;

    const returnedUsers =
      limit !== undefined
        ? filteredUsers.slice(
            Number(offset) || 0,
            (Number(offset) || 0) + Number(limit)
          )
        : filteredUsers;

    return {
      users: returnedUsers,
      totalCount: filteredUsers.length,
    };
  },
};

export const user = {
  type: UserType,
  args: {
    email: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (_: undefined, { email }: StringArgsType): Promise<IUser> => {
    return await User.findOne({ email });
  },
};

export const register = {
  type: SuccessType,
  args: {
    name: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
    password: { type: GraphQLNonNull(GraphQLString) },
    passwordConfirmation: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { name, email, password, passwordConfirmation }: StringArgsType
  ): Promise<{ success: boolean }> => {
    if (!name) throw new Error("Name is required");
    if (!email) throw new Error("Email address is required");

    const foundUser = await User.findOne({ email, isVerified: true });

    if (foundUser) {
      throw new Error("User with this email address already exists");
    }

    const foundNotVerifiedUser = await User.findOne({
      email,
      isVerified: false,
    });

    if (foundNotVerifiedUser) {
      await User.findOneAndDelete({ email });
    }

    if (name.length > 30) {
      throw new Error("User name is too long");
    }

    if (password.length < 8 || password.length > 16) {
      throw new Error("Password must be 8-16 characters long");
    }

    if (password !== passwordConfirmation) {
      throw new Error("Password and password confirmation do not match");
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      isVerified: false,
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
    });

    const user = await newUser.save();

    await sendVerificationEmail(user);

    return { success: true };
  },
};

export const login = {
  type: LoginType,
  args: {
    email: { type: GraphQLNonNull(GraphQLString) },
    password: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { email, password }: StringArgsType,
    { res }: Request
  ): Promise<{ user: IUser; token: string }> => {
    if (!res) throw new Error("Something went wrong");
    if (!email) throw new Error("Email address is required");

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User was not found");
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    if (!passwordIsCorrect) {
      throw new Error("Password is wrong");
    }

    if (!user.isVerified) {
      throw new Error("Account is not verified");
    }

    const token = signJWT(user._id, email);

    return { user, token };
  },
};

export const loginWithToken = {
  type: LoginType,
  resolve: (
    _: undefined,
    __: unknown,
    context: Request
  ): { user: IUser; token: string } | null => {
    try {
      const { user, res } = context;

      if (!res) throw new Error("Something went wrong");

      if (!user) return null;

      const token = signJWT(user._id, user.email);

      return { user, token };
    } catch {
      return null;
    }
  },
};

export const updateUser = {
  type: UserType,
  args: {
    name: { type: GraphQLString },
    about: { type: GraphQLString },
  },
  resolve: async (
    _: undefined,
    { name, about }: StringArgsType,
    context: Request
  ): Promise<IUser> => {
    const { user } = context;

    if (!user) throw new Error("Not authenticated");
    if (name === "") throw new Error("User name cannot be empty");
    if (name && name.length > 30) throw new Error("Name is too long");
    if (about && about.length > 400) throw new Error("About is too long");

    return await User.findOneAndUpdate(
      { email: user.email },
      {
        $set: {
          name: name.trim(),
          about: about.trim(),
        },
      },
      { returnOriginal: false }
    );
  },
};

export const verifyAccount = {
  type: SuccessType,
  args: {
    code: { type: GraphQLNonNull(GraphQLString) },
    userEmail: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { userEmail, code }: StringArgsType
  ): Promise<{ success: boolean }> => {
    const foundVerificationCode = await VerificationCode.findOne({ userEmail });

    if (!foundVerificationCode) {
      throw new Error("Verification code not found");
    }

    const codeIsCorrect = await bcrypt.compare(
      code,
      foundVerificationCode.code
    );

    if (!codeIsCorrect) {
      throw new Error("Code is incorrect");
    }

    await VerificationCode.findOneAndDelete({ userEmail });

    await User.findOneAndUpdate(
      { email: userEmail },
      { $set: { isVerified: true } }
    );

    return { success: true };
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

    if (!user) throw new Error("Not authenticated");

    const passwordIsCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordIsCorrect) {
      throw new Error("Password is wrong");
    }

    if (newPassword.length > 16 || newPassword.length < 8) {
      throw new Error("Password must be 8-16 characters long");
    }

    if (newPassword !== passwordConfirmation) {
      throw new Error("Passwords to not match");
    }

    const hashedPassword = await hashPassword(newPassword);

    await User.findOneAndUpdate(
      { email: user.email },
      { $set: { password: hashedPassword } }
    );

    return { success: true };
  },
};
