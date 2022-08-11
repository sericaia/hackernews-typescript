import * as jwt from "jsonwebtoken";

export interface AuthTokenPayload {
  userId: number;
}

export function decodeAuthHeader(
  authHeader: string,
  jwtAppSecret: string
): AuthTokenPayload {
  // only get the token from authentication header
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    throw new Error("No token found");
  }
  return jwt.verify(token, jwtAppSecret) as AuthTokenPayload;
}
