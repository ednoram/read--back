import { CookieOptions } from "express";

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI || "";
export const TOKEN_SECRET = process.env.TOKEN_SECRET || "";
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  maxAge: 24 * 3600 * 1000,
  secure: !IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? "none" : "lax",
};
