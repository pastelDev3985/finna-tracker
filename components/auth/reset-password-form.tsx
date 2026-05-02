"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { error: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(1, { error: "Please confirm your new password" }),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FieldErrors = Partial<Record<"newPassword" | "confirmPassword", string>>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [tokenState, setTokenState] = useState<
    "checking" | "valid" | "invalid"
  >("checking");
  const [tokenError, setTokenError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate the token on mount
  useEffect(() => {
    if (!token) {
      setTokenState("invalid");
      setTokenError("No reset token found.");
      return;
    }

    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then(
        (data: { valid?: boolean; error?: string }) => {
          if (data.valid) {
            setTokenState("valid");
          } else {
            setTokenState("invalid");
            setTokenError(data.error ?? "This reset link is invalid or has expired.");
          }
        },
      )
      .catch(() => {
        setTokenState("invalid");
        setTokenError("Could not verify the reset link. Please try again.");
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = resetSchema.safeParse({ newPassword, confirmPassword });
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      setFieldErrors({
        newPassword: flat.fieldErrors.newPassword?.[0],
        confirmPassword: flat.fieldErrors.confirmPassword?.[0],
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: parsed.data.newPassword,
          confirmPassword: parsed.data.confirmPassword,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !data.success) {
        if (data.error?.toLowerCase().includes("expired") || data.error?.toLowerCase().includes("invalid")) {
          setTokenState("invalid");
          setTokenError(data.error ?? "This reset link has expired.");
        } else {
          setFieldErrors({ newPassword: data.error ?? "Failed to reset password." });
        }
        return;
      }

      toast.success("Password updated — please sign in.");
      router.push("/login");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (tokenState === "checking") {
    return (
      <div className="glass-light w-full max-w-md rounded-2xl border border-border-light p-6 shadow-lg sm:p-8">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground">Validating reset link…</p>
        </div>
      </div>
    );
  }

  // ── Invalid / expired token ────────────────────────────────────────────────
  if (tokenState === "invalid") {
    return (
      <div className="glass-light w-full max-w-md rounded-2xl border border-border-light p-6 shadow-lg sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle
              className="size-7 text-destructive"
              aria-hidden
            />
          </div>
          <div>
            <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
              Link invalid or expired
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {tokenError}
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-secondary transition-all duration-200 hover:-translate-y-px cursor-pointer"
          >
            Request a new link
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-primary underline-offset-4 transition-all duration-200 hover:text-primary-hover hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  // ── Valid token — show reset form ──────────────────────────────────────────
  return (
    <div className="glass-light w-full max-w-md rounded-2xl border border-border-light p-6 shadow-lg sm:p-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <ShieldCheck className="size-7 text-primary" aria-hidden />
        </div>
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Set a new password
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a strong password for your account.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* New password */}
        <div className="grid gap-2">
          <Label htmlFor="new-password">New password</Label>
          <div className="relative">
            <Input
              id="new-password"
              name="newPassword"
              type={showNew ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              aria-invalid={!!fieldErrors.newPassword}
              className="pr-10"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              aria-label={showNew ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
            >
              {showNew ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
          {fieldErrors.newPassword && (
            <p className="text-xs text-destructive" role="alert">
              {fieldErrors.newPassword}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div className="grid gap-2">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
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
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
            >
              {showConfirm ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-destructive" role="alert">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-11 w-full cursor-pointer rounded-lg font-semibold transition-all duration-200 hover:-translate-y-px"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Updating…
            </>
          ) : (
            "Update password"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 transition-all duration-200 hover:text-primary-hover hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
