import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

function Fallback() {
  return (
    <div
      className="h-80 w-full max-w-md animate-pulse rounded-2xl border border-border bg-muted/40"
      aria-hidden
    />
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
