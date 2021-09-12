import { Request, Response, NextFunction } from "express";

import { User } from "@models";
import { verifyJWT } from "@utils";

const auth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = String(req.headers.authorization);

    if (!token) {
      req.user = null;
      next();
      return;
    }

    const decodedData = await verifyJWT(token);
    const user = await User.findOne({ email: decodedData.email });

    req.user = user;
    next();
  } catch {
    req.user = null;
    next();
  }
};

export default auth;
