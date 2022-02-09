import jwt from "jsonwebtoken";

import { TOKEN_EXPIRY_SECONDS, TOKEN_SECRET } from "@config";

const signJWT = (_id: string, email: string): string => {
  return jwt.sign(
    { email, _id, duration: TOKEN_EXPIRY_SECONDS },
    TOKEN_SECRET,
    { expiresIn: TOKEN_EXPIRY_SECONDS }
  );
};

export default signJWT;
