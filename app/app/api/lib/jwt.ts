import * as jose from "jose";
import { env } from "./env";

const JWT_ALG = "HS256";
const EXPIRES_IN = "7d";

export type JWTPayload = {
  userId: number;
  email: string;
  role: string;
};

export async function signToken(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(env.jwtSecret);
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(env.jwtSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
      clockTolerance: 60,
    });
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch (error) {
    console.warn("[jwt] verification failed:", error);
    return null;
  }
}
