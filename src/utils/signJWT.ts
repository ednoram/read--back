import jwt from "jsonwebtoken";

import { TOKEN_SECRET } from "@config";

const signJWT = (
  _id: string,
  email: string,
  duration: number | string
): string => {
  return jwt.sign({ email, _id, duration }, TOKEN_SECRET);
};

export default signJWT;
