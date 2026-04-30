"use client"

import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Dashboard overview",
    desc: "See income, expenses, and net balance at a glance.",
  },
  {
    icon: Wallet,
    title: "Smart budgeting",
    desc: "Set monthly limits per category and track overspending.",
  },
  {
    icon: Target,
    title: "Savings goals",
    desc: "Create goals, add contributions, and hit your targets.",
  },
  {
    icon: Sparkles,
    title: "AI insights",
    desc: "Chat with your financial data powered by Claude.",
  },
]

interface OnboardingClientProps {
  userName: string
}

export function OnboardingClient({ userName }: OnboardingClientProps) {
  const [step, setStep] = useState<1 | 2>(1)

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-16">
      <div className="glass-light w-full max-w-lg rounded-2xl border border-border-light p-8">
        {step === 1 ? (
          <Step1 userName={userName} onNext={() => setStep(2)} />
        ) : (
          <Step2 />
        )}
      </div>
    </div>
  )
}

function Step1({ userName, onNext }: { userName: string; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="size-7 text-primary" aria-hidden />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Welcome, {userName}!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Finora is your personal finance companion. Let&apos;s get you set up in 30 seconds.
          </p>
        </div>
      </div>

      <div className="grid gap-3 text-left">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="size-4 text-primary" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={onNext}
        className="h-12 w-full cursor-pointer font-semibold transition-all duration-200 hover:-translate-y-px"
      >
        Get started
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  )
}

function Step2() {
  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--color-success)]/10">
          <CheckCircle2 className="size-7 text-[var(--color-success)]" aria-hidden />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">
            You&apos;re all set!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ve added 15 default categories for income and expenses. You can
            customise them any time in Settings.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4 text-left">
        <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Default categories added
        </p>
        <div className="grid grid-cols-2 gap-1">
          {[
            "Salary", "Freelance", "Business", "Investment", "Other Income",
            "Food & Drink", "Transport", "Housing", "Utilities", "Healthcare",
            "Shopping", "Entertainment", "Education", "Savings Transfer", "Other",
          ].map((cat) => (
            <p key={cat} className="text-xs text-muted-foreground">
              · {cat}
            </p>
          ))}
        </div>
      </div>

      <Link
        href="/dashboard"
        className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-px hover:bg-primary-hover"
      >
        Go to dashboard
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  )
}
