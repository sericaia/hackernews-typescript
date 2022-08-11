import { Request } from "express";
import { PrismaClient } from "@prisma/client";
import { decodeAuthHeader, AuthTokenPayload } from "./utils/auth";

export const prisma = new PrismaClient();
const JWT_APP_SECRET = process.env.JWT_APP_SECRET;

if (!JWT_APP_SECRET) {
  throw new Error("JWT_APP_SECRET must be defined");
}

type AuthEnv = {
  [key: string]: string;
};
export interface Context {
  prisma: PrismaClient;
  authEnv: AuthEnv;
  userId?: number;
}

export const context = ({ req }: { req: Request }): Context => {
  const token =
    req && req.headers.authorization
      ? decodeAuthHeader(req.headers.authorization, JWT_APP_SECRET)
      : null;

  return {
    prisma,
    authEnv: {
      JWT_APP_SECRET,
    },
    userId: token?.userId,
  };
};
