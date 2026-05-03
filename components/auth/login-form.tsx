"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.email({ error: "Please enter a valid email address" }),
  password: z.string().min(1, { error: "Password is required" }),
});

type FieldErrors = Partial<Record<"email" | "password", string>>;

function firstFieldMessage(
  fieldErrors: Record<string, string[] | undefined> | undefined,
  key: string
): string | undefined {
  const arr = fieldErrors?.[key];
  return arr?.[0];
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      setFieldErrors({
        email: firstFieldMessage(flat.fieldErrors, "email"),
        password: firstFieldMessage(flat.fieldErrors, "password"),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error("Invalid email or password.");
        return;
      }

      if (result?.ok) {
        toast.success("Signed in successfully.");
        router.push(result.url ?? callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={cn(
        "glass-light w-full max-w-md rounded-2xl border border-border-light p-6 shadow-lg sm:p-8"
      )}
    >
      <div className="mb-6">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back to <span className="text-primary">Finora</span>. Manage your money with clarity.
        </p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!fieldErrors.email}
            placeholder="you@example.com"
            disabled={isSubmitting}
          />
          {fieldErrors.email ? (
            <p className="text-xs text-destructive" role="alert">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline-offset-4 transition-all duration-200 hover:text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!fieldErrors.password}
              className="pr-10"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
          {fieldErrors.password ? (
            <p className="text-xs text-destructive" role="alert">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="mt-1 h-11 w-full cursor-pointer rounded-lg font-semibold transition-all duration-200 hover:-translate-y-px"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="cursor-pointer font-medium text-primary underline-offset-4 transition-all duration-200 hover:text-primary-hover hover:underline"
          >
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
