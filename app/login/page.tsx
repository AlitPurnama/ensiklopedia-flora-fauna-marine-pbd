"use client";

import { useActionState } from "react";
import { Sprout } from "lucide-react";
import { login, type LoginState } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initial: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canopy px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lift">
        <div className="mb-6 flex items-center gap-2">
          <Sprout className="size-5 text-primary" />
          <span className="font-heading text-sm font-semibold tracking-tight">
            Ensiklopedia PBD · Admin
          </span>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Kata Sandi
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {state.error && (
            <p aria-live="polite" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Memeriksa…" : "Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
}
