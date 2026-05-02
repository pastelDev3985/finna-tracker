"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z.string().min(2, { error: "Name must be at least 2 characters" }).trim(),
    email: z.email({ error: "Please enter a valid email address" }).trim(),
    password: z.string().min(8, { error: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(1, { error: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FieldKey = "name" | "email" | "password" | "confirmPassword";
type FieldErrors = Partial<Record<FieldKey, string>>;

function firstFieldMessage(
  fieldErrors: Record<string, string[] | undefined> | undefined,
  key: string
): string | undefined {
  const arr = fieldErrors?.[key];
  return arr?.[0];
}

export function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      const flat = parsed.error.flatten();
      setFieldErrors({
        name: firstFieldMessage(flat.fieldErrors, "name"),
        email: firstFieldMessage(flat.fieldErrors, "email"),
        password: firstFieldMessage(flat.fieldErrors, "password"),
        confirmPassword: firstFieldMessage(flat.fieldErrors, "confirmPassword"),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          password: parsed.data.password,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        fields?: Record<string, string[]>;
      };

      if (res.status === 400 && data.fields) {
        setFieldErrors({
          name: data.fields.name?.[0],
          email: data.fields.email?.[0],
          password: data.fields.password?.[0],
        });
        toast.error("Please fix the highlighted fields.");
        return;
      }

      if (res.status === 409) {
        setFieldErrors((prev) => ({
          ...prev,
          email: data.error ?? "This email is already registered.",
        }));
        toast.error(data.error ?? "An account with this email already exists.");
        return;
      }

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      // Auto sign-in so the verify-email page has a session to gate on
      const signInResult = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        toast.success("Account created. Please verify your email.");
        router.push("/verify-email");
        router.refresh();
      } else {
        toast.success("Account created. Please sign in.");
        router.push("/login");
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
          Create account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start tracking your finances in minutes.
        </p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-2">
          <Label htmlFor="register-name">Name</Label>
          <Input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!fieldErrors.name}
            placeholder="Your name"
            disabled={isSubmitting}
          />
          {fieldErrors.name ? (
            <p className="text-xs text-destructive" role="alert">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
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
          <Label htmlFor="register-password">Password</Label>
          <div className="relative">
            <Input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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

        <div className="grid gap-2">
          <Label htmlFor="register-confirm">Confirm password</Label>
          <div className="relative">
            <Input
              id="register-confirm"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!fieldErrors.confirmPassword}
              className="pr-10"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirm ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword ? (
            <p className="text-xs text-destructive" role="alert">
              {fieldErrors.confirmPassword}
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
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="cursor-pointer font-medium text-primary underline-offset-4 transition-all duration-200 hover:text-primary-hover hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
