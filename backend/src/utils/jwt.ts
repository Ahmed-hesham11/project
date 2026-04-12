import jwt from "jsonwebtoken";
import { AuthUser } from "../types/express";
import { env } from "../config/env";

export function signAccessToken(payload: AuthUser) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthUser;
}
