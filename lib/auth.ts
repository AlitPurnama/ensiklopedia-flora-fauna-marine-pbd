import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual } from "node:crypto";

const COOKIE = "session";
if ((process.env.SESSION_SECRET ?? "").length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters");
}
const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  // ponytail: length check first so timingSafeEqual doesn't throw on mismatch
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** True when the given credentials match the single admin in env. */
export function checkCredentials(email: string, password: string) {
  return (
    safeEqual(email, process.env.ADMIN_EMAIL ?? "") &&
    safeEqual(password, process.env.ADMIN_PASSWORD ?? "")
  );
}

export async function createSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** Returns true if the request carries a valid admin session. */
export async function verifySession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}
