"use client"

import { useEffect } from "react"
import { AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-16">
      <div className="glass-light w-full max-w-md space-y-6 rounded-2xl border border-border-light p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-error/10">
            <AlertCircle className="size-7 text-error" aria-hidden />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              An unexpected error occurred. Don&apos;t worry — your data is safe.
            </p>
          </div>
        </div>

        {error.digest && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-left">
            <p className="text-xs font-mono text-muted-foreground break-all">
              {error.digest}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={reset}
            className="h-12 w-full cursor-pointer font-semibold transition-all duration-200 hover:-translate-y-px"
          >
            Try again
            <ArrowRight className="size-4" aria-hidden />
          </Button>
          <a
            href="/dashboard"
            className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-6 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-px hover:bg-muted"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
