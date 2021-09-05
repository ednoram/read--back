import { CookieOptions } from "express";

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI || "";
export const TOKEN_SECRET = process.env.TOKEN_SECRET || "";
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const MAIL_SENDER_PASS = process.env.MAIL_SENDER_PASS || "";
export const MAIL_SENDER_EMAIL = process.env.MAIL_SENDER_EMAIL || "";

export const TOKEN_EXPIRY_SECONDS = 7 * 24 * 3600;

export const TOKEN_COOKIE_OPTIONS: CookieOptions = {
  secure: true,
  httpOnly: true,
  maxAge: TOKEN_EXPIRY_SECONDS * 1000,
  sameSite: IS_PRODUCTION ? "none" : "lax",
};
