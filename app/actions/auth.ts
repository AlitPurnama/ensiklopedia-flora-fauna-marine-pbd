"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkCredentials,
  createSession,
  destroySession,
} from "@/lib/auth";
import { rateLimited, recordFailure, clearFailures } from "@/lib/rate-limit";

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return { error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." };
  }
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    recordFailure(ip);
    return { error: "Email atau kata sandi tidak valid." };
  }
  if (!checkCredentials(parsed.data.email, parsed.data.password)) {
    recordFailure(ip);
    return { error: "Email atau kata sandi salah." };
  }
  clearFailures(ip);
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
