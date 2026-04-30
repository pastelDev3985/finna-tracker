import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

function LoginFormFallback() {
  return (
    <div
      className="h-64 w-full max-w-md animate-pulse rounded-2xl border border-border bg-muted/40"
      aria-hidden
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
