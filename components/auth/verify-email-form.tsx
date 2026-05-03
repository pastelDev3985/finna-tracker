"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const RESEND_COOLDOWN = 60;

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, 2);
  const masked = "*".repeat(Math.max(1, local.length - 2));
  return `${visible}${masked}@${domain}`;
}

export function VerifyEmailForm() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputRef = useRef<HTMLInputElement>(null);

  const maskedEmail = session?.user?.email
    ? maskEmail(session.user.email)
    : "your email address";

  // Countdown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError("Please enter the 6-digit code from your email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        verified?: boolean;
        error?: string;
      };

      if (!res.ok || !data.verified) {
        setError(data.error ?? "Incorrect code. Please try again.");
        return;
      }

      // Refresh JWT: merge client patch and/or load emailVerified from DB (see jwt callback).
      await update({
        user: { isEmailVerified: true },
      });
      toast.success("Email verified! Setting up your account…");
      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setIsResending(true);
    try {
      const res = await fetch("/api/auth/resend-otp", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        toast.error(data.error ?? "Failed to resend code. Please try again.");
        return;
      }

      toast.success(data.message ?? "A new code has been sent.");
      setCooldown(RESEND_COOLDOWN);
      setOtp("");
      setError("");
      inputRef.current?.focus();
    } catch {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="glass-light w-full max-w-md rounded-2xl border border-border-light p-6 shadow-lg sm:p-8">
      {/* Icon */}
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Mail className="size-7 text-primary" aria-hidden />
        </div>
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Verify your email
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{maskedEmail}</span>.
            Enter it below.
          </p>
        </div>
      </div>

      <form onSubmit={handleVerify} className="flex flex-col gap-5" noValidate>
        <div className="grid gap-2">
          <Input
            ref={inputRef}
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 6);
              setOtp(val);
              if (error) setError("");
            }}
            disabled={isSubmitting}
            aria-label="6-digit verification code"
            aria-invalid={!!error}
            className="text-center text-2xl font-mono tracking-[0.5em] h-14"
          />
          {error && (
            <p className="text-xs text-destructive text-center" role="alert">
              {error}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-11 w-full cursor-pointer rounded-lg font-semibold transition-all duration-200 hover:-translate-y-px"
          disabled={isSubmitting || otp.length !== 6}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Verifying…
            </>
          ) : (
            "Verify email"
          )}
        </Button>

        <div className="flex flex-col items-center gap-1">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive a code?
          </p>
          <Button
            type="button"
            variant="ghost"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending || isSubmitting}
            className={cn(
              "h-auto cursor-pointer p-1 text-sm font-medium transition-all duration-200",
              cooldown > 0
                ? "text-muted-foreground"
                : "text-primary hover:text-primary-hover",
            )}
          >
            {isResending ? (
              <>
                <Loader2 className="size-3 animate-spin" aria-hidden />
                Sending…
              </>
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : (
              "Resend code"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
