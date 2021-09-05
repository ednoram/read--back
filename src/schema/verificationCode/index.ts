import { GraphQLNonNull, GraphQLString } from "graphql";

import { User } from "@models";
import { StringArgsType } from "@types";
import { sendVerificationEmail } from "@utils";
import { SuccessType } from "@schema/globalTypes";

export const sendVerificationCode = {
  type: SuccessType,
  args: {
    userEmail: { type: GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _: undefined,
    { userEmail }: StringArgsType
  ): Promise<{ success: boolean }> => {
    const user = await User.findOne({ email: userEmail });

    await sendVerificationEmail(user);

    return { success: true };
  },
};
