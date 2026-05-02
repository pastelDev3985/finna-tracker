import { Suspense } from "react";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

function Fallback() {
  return (
    <div
      className="h-72 w-full max-w-md animate-pulse rounded-2xl border border-border bg-muted/40"
      aria-hidden
    />
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
