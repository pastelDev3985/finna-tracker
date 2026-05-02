"use client";

import {
  ArrowLeftRight,
  BarChart2,
  BookMarked,
  LayoutDashboard,
  PiggyBank,
  Settings2,
  Sparkles,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TOPICS = [
  { id: "essentials", label: "Essentials", icon: LayoutDashboard },
  { id: "reports", label: "Reports & AI", icon: BarChart2 },
  { id: "settings", label: "Settings", icon: Settings2 },
] as const;

const CARDS = [
  {
    id: "essentials",
    icon: Wallet,
    title: "Daily money tracking",
    body: "Record income and expenses, use categories and notes, and sort your transaction list by date or category.",
    bullets: [
      "Transactions: add, edit, or remove entries.",
      "Budgets: monthly limits per expense category.",
      "Goals: target amount, deadline, and contributions.",
    ],
    accent: "from-primary/12 via-transparent",
  },
  {
    id: "reports",
    icon: Sparkles,
    title: "Reports & AI insights",
    body: "Reports shows charts for any month you choose. AI Insights answers questions about your data — spending, budgets, and goals — not general chat.",
    bullets: [
      "Use Reports for trends and category breakdowns.",
      "Use AI for plain-language answers tied to your numbers.",
    ],
    accent: "from-primary/15 via-transparent",
  },
  {
    id: "settings",
    icon: BookMarked,
    title: "Settings & categories",
    body: "Update your profile, password, display currency, and theme. Customise categories; onboarding may seed defaults for new accounts.",
    bullets: [
      "Currency changes how amounts are formatted only.",
      "Danger zone removes your account permanently.",
    ],
    accent: "from-primary/10 via-transparent",
  },
] as const;

export function GuidePageContent() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      {/* Jump links */}
      <nav
        aria-label="Guide sections"
        className="glass flex flex-wrap gap-2 rounded-2xl p-3"
      >
        {TOPICS.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs font-medium text-foreground transition-[background-color,border-color,transform] duration-150",
              "hover:border-primary/40 hover:bg-primary/10 hover:text-foreground active:scale-[0.97] active:bg-primary/15",
            )}
          >
            <Icon className="size-3.5 shrink-0 text-primary" aria-hidden />
            {label}
          </a>
        ))}
        <Link
          href="/dashboard"
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-foreground transition-[background-color,transform] duration-150 hover:bg-primary/20 active:scale-[0.97] active:bg-primary/25"
        >
          <PiggyBank className="size-3.5 shrink-0 text-primary" aria-hidden />
          Open dashboard
        </Link>
      </nav>

      {/* Feature cards */}
      <div className="flex flex-col gap-5">
        {CARDS.map((card) => (
          <article
            key={card.id}
            id={card.id}
            className={cn(
              "relative glass scroll-mt-24 overflow-hidden rounded-2xl border border-border/80",
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-0 bg-linear-to-br opacity-80",
                card.accent,
              )}
              aria-hidden
            />
            <div className="relative flex flex-col gap-4 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
                  <card.icon
                    className="size-5 text-primary"
                    strokeWidth={2}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                    {card.body}
                  </p>
                </div>
              </div>
              <ul className="space-y-2 border-t border-border/50 pt-4 text-sm text-foreground/90">
                {card.bullets.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span
                      className="mt-2 size-1 shrink-0 rounded-full bg-primary"
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <div className="glass flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/20 p-5 sm:flex-row sm:items-center">
        <p className="text-sm font-medium text-foreground">
          Legal terms and disclaimers
        </p>
        <Link
          href="/terms"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary-hover active:bg-primary-active active:scale-[0.97]"
        >
          Read terms of service
          <ArrowLeftRight className="size-4 rotate-180" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
