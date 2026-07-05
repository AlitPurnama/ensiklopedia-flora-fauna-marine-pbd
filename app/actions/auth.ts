"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import {
  checkCredentials,
  createSession,
  destroySession,
} from "@/lib/auth";

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Email atau kata sandi tidak valid." };
  }
  if (!checkCredentials(parsed.data.email, parsed.data.password)) {
    return { error: "Email atau kata sandi salah." };
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
