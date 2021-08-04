import jwt, { JwtPayload } from "jsonwebtoken";

import { TOKEN_SECRET } from "@config";

const verifyJWT = async (token: string): Promise<JwtPayload> => {
  const decodedData = await jwt.verify(token, TOKEN_SECRET);

  if (decodedData && typeof decodedData !== "string") {
    return decodedData;
  } else {
    throw new Error("Token is not valid");
  }
};

export default verifyJWT;
