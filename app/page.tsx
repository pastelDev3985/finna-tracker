import {
  ArrowRight,
  BadgeCheck,
  BarChart2,
  Lock,
  Shield,
  Sparkles,
  TrendingDown,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-gradient-to-t from-background from-0% via-primary/[0.06] via-35% to-muted to-100% dark:from-background dark:from-0% dark:via-primary/[0.03] dark:via-40% dark:to-black dark:to-100%">
      <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Top bar — glass strip */}
        <header className="glass-light mb-10 flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-border-light px-4 py-3 sm:flex-row sm:items-center sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl border border-border-light bg-card/50 font-heading text-lg font-bold text-foreground shadow-sm">
              F
            </div>
            <div>
              <p className="font-heading text-base font-semibold tracking-tight text-foreground">
                Finora
              </p>
              <p className="text-xs text-muted-foreground">
                Start managing your money the smart way
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-px hover:bg-muted"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-px hover:bg-primary-hover active:bg-primary-active"
            >
              Get started
            </Link>
          </nav>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Hero — full width */}
          <div className="space-y-8 lg:col-span-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-foreground">
              <span>Money no go control you again</span>
            </div>

            <h1 className="font-heading text-4xl leading-[1.1] font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              See your money in{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  focus
                </span>
                <span
                  className="absolute -inset-1 -z-0 rounded-lg bg-primary/15 blur-sm"
                  aria-hidden
                />
              </span>{" "}
              <br className="hidden sm:block" />
              not noise.
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              You know that feeling when your money just disappears? One minute
              you get balance, next minute you dey wonder what happened Finora
              helps you see everything clearly so you can stay in control and
              make better money moves every day
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-px hover:bg-primary-hover active:bg-primary-active"
              >
                Create free account
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
              <Link
                href="/login"
                className="glass inline-flex h-12 cursor-pointer items-center justify-center rounded-lg border border-border-light px-6 text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-px hover:border-primary/30 hover:shadow-md"
              >
                I already have access
              </Link>
            </div>

            <ul className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {["No card required", "Dark mode ready", "Built for focus"].map(
                (t) => (
                  <li
                    key={t}
                    className="glass rounded-full border border-border-light px-3 py-1.5"
                  >
                    {t}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Feature ribbon */}
        <section
          className="mt-16 rounded-2xl border border-border-light bg-card/40 p-6 backdrop-blur-sm sm:p-8 lg:mt-20"
          aria-labelledby="features-heading"
        >
          <div className="mb-8 text-center lg:mx-auto lg:max-w-2xl lg:text-center">
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              Features
            </p>
            <h2
              id="features-heading"
              className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Product pillars
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Finora is built on four core principles that help you stay in
              control of your money.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Sparkles,
                title: "Track your spending with ease",
                body: "See every cedi you spend without stress. No more “where my money go?” moments",
              },
              {
                icon: Wallet,
                title: "Simple budgeting that works",
                body: "Set your budget and Finora will help you stick to it without pressure",
              },
              {
                icon: BarChart2,
                title: "Clear insights",
                body: "Understand your money in a simple way. No complicated charts, just what you need to know",
              },
              {
                icon: Shield,
                title: "Everything in one place",
                body: "Your income, expenses, and savings all together nice and clean",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="glass-light border border-border-light p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md"
              >
                <Icon
                  className="mb-3 size-5 text-primary"
                  strokeWidth={2}
                  aria-hidden
                />
                <p className="font-heading text-base font-semibold text-foreground">
                  {title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="relative z-10 mt-auto border-t border-border bg-muted/30 py-8 dark:bg-muted/20">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-center text-sm leading-relaxed text-muted-foreground sm:text-left sm:text-base">
            Create your free account and make your money work for you.
          </p>

          <p className="text-center  text-xs text-muted-foreground sm:text-center sm:text-base">
            ©{new Date().getFullYear()} Finora. All rights reserved.
          </p>
          <nav
            className="flex flex-wrap items-center justify-center gap-3 text-sm"
            aria-label="Footer"
          >
            <Link
              href="/login"
              className="cursor-pointer font-medium text-foreground transition-all duration-200 hover:text-primary"
            >
              Sign in
            </Link>
            <span className="text-muted-foreground/50" aria-hidden>
              ·
            </span>
            <Link
              href="/register"
              className="cursor-pointer font-medium text-foreground transition-all duration-200 hover:text-primary"
            >
              Register
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
