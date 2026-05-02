import {
  ArrowRight,
  BrainCircuit,
  Layers,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-background">
      {/* ── Decorative background orbs ── */}
      {/*
        These give the glass elements something to blur against.
        Without them, backdrop-filter has nothing to frost.
      */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        {/* Yellow primary glow — top-left */}
        <div className="absolute -top-48 -left-48 h-[640px] w-[640px] rounded-full bg-primary/20 blur-[120px]" />
        {/* Neutral depth orb — right side */}
        <div className="absolute top-1/4 -right-32 h-[480px] w-[480px] rounded-full bg-(--fin-dark-9)/30 blur-[100px]" />
        {/* Subtle yellow mid-page */}
        <div className="absolute bottom-1/3 left-1/4 h-[360px] w-[360px] rounded-full bg-primary/8 blur-[90px]" />
      </div>

      {/* ── Page content ── */}
      <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* ── Navbar ── */}
        <header className="glass mb-12 flex flex-row items-center justify-between gap-4 rounded-2xl px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-primary/10 font-heading text-lg font-bold text-primary shadow-sm">
              F
            </div>
            <div>
              <p className="font-heading text-base font-semibold tracking-tight text-foreground">
                Finora
              </p>
              <p className="text-xs text-muted-foreground">
                AI-powered personal finance
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-px hover:bg-muted"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-px hover:bg-primary-hover active:bg-primary-active"
            >
              Get started
            </Link>
          </nav>
        </header>

        {/* ── Hero ── */}
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          {/* Announcement badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-foreground">
            <Sparkles className="size-3 text-primary" aria-hidden />
            <span>Money no go control you again</span>
          </div>

          <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            See your money in{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-linear-to-r from-foreground to-primary bg-clip-text text-transparent">
                focus
              </span>
              <span
                className="absolute -inset-1 z-0 rounded-lg bg-primary/15 blur-sm"
                aria-hidden
              />
            </span>{" "}
            not noise.
          </h1>

          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            You know that feeling when your money just disappears? One minute
            you get balance, next minute you dey wonder what happened. Finora
            helps you see everything clearly so you can stay in control and make
            better money moves every day.
          </p>

          <div className="flex flex-row items-center justify-center gap-3 sm:flex-col">
            <Link
              href="/register"
              className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-px hover:bg-primary-hover active:bg-primary-active"
            >
              Create free account
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
            <Link
              href="/login"
              className="glass inline-flex h-12 cursor-pointer items-center justify-center rounded-lg px-6 text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-px hover:shadow-md"
            >
              I already have access
            </Link>
          </div>

          {/* Trust pills */}
          <ul className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            {["Free to start", "No card required", "Dark mode ready"].map(
              (t) => (
                <li
                  key={t}
                  className="glass rounded-full border border-border px-3 py-1.5"
                >
                  {t}
                </li>
              ),
            )}
          </ul>
        </div>

        {/* ── Stats strip ── */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4">
          {[
            { stat: "15+", label: "Default categories" },
            { stat: "AI-first", label: "Powered by Claude" },
            { stat: "100%", label: "Private — your data" },
          ].map(({ stat, label }) => (
            <div
              key={label}
              className="glass flex flex-col items-center gap-1 rounded-2xl py-5 text-center"
            >
              <span className="font-heading text-xl font-bold text-primary">
                {stat}
              </span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Feature cards ── */}
        <section className="mt-16 lg:mt-20" aria-labelledby="features-heading">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Why Finora
            </p>
            <h2
              id="features-heading"
              className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Built for real money clarity
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              From daily expense tracking to AI-powered financial advice to
              everything you need in one focused app.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Wallet,
                title: "Effortless tracking",
                body: "Log every cedi of income and spending in seconds. Categories, notes, recurrence, all covered.",
              },
              {
                icon: Layers,
                title: "Smart budgeting",
                body: "Set monthly limits per category. Finora shows you exactly where you're on track and where you're not.",
              },
              {
                icon: Target,
                title: "Savings goals",
                body: "Create goals, log contributions, and watch your ring fill up as you get closer to your target.",
              },
              {
                icon: BrainCircuit,
                title: "AI insights (Claude)",
                body: "Ask your finances anything. Get real answers about your spending, goals, and money habits powered by Claude.",
                highlight: true,
              },
            ].map(({ icon: Icon, title, body, highlight }) => (
              <div
                key={title}
                className={`glass-light relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  highlight
                    ? "border-primary/30 hover:border-primary/50"
                    : "border-border hover:border-primary/20"
                }`}
              >
                {highlight && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-primary/5 via-transparent to-transparent"
                    aria-hidden
                  />
                )}
                <div className="relative z-10">
                  <div
                    className={`mb-4 flex size-10 items-center justify-center rounded-xl ${
                      highlight ? "bg-primary/15" : "bg-primary/8"
                    }`}
                  >
                    <Icon
                      className="size-5 text-primary"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </div>
                  <p className="font-heading text-base font-semibold text-foreground">
                    {title}
                  </p>
                  {highlight && (
                    <span className="mb-2 inline-flex items-center gap-1 rounded-md border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      <Sparkles className="size-2.5" aria-hidden />
                      AI-powered
                    </span>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── AI teaser panel ── */}
        <section className="mt-16 lg:mt-20" aria-label="AI insights preview">
          <div className="glass relative overflow-hidden rounded-2xl p-8 sm:p-10">
            {/* Background glow inside panel */}
            <div
              className="pointer-events-none absolute -top-12 -left-12 h-64 w-64 rounded-full bg-primary/15 blur-[60px]"
              aria-hidden
            />
            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                    <BrainCircuit className="size-4 text-primary" aria-hidden />
                  </div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    AI Finance Assistant
                  </span>
                </div>
                <blockquote className="font-heading text-lg font-semibold leading-snug text-foreground sm:text-xl">
                  &ldquo;You spent 34% more on food this month compared to last.
                  Want me to show you where to cut back?&rdquo;
                </blockquote>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Finora&apos;s built-in AI reads your actual data and gives you
                  real, actionable advice — not generic tips pulled from the
                  internet.
                </p>
              </div>
              <div className="shrink-0">
                <Link
                  href="/register"
                  className="group inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-px hover:bg-primary-hover"
                >
                  Try it free
                  <ArrowRight
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 mt-16 border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            {/* Brand */}
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 font-heading text-sm font-bold text-primary">
                  F
                </div>
                <p className="text-sm font-semibold text-foreground">Finora</p>
              </div>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} All rights reserved.
              </p>
            </div>

            {/* CTA */}
            <p className="text-center text-sm text-muted-foreground">
              Create your free account and make your money work for you.
            </p>

            {/* Nav */}
            <nav
              className="flex items-center gap-4 text-sm"
              aria-label="Footer navigation"
            >
              <Link
                href="/login"
                className="cursor-pointer font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="cursor-pointer font-medium text-primary transition-colors duration-200 hover:text-primary-hover"
              >
                Register →
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
