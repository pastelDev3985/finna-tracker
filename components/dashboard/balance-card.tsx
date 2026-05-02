import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  totalIncome: string;
  totalExpenses: string;
  net: string;
  netIsPositive: boolean;
  month: number;
  year: number;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function BalanceCard({
  totalIncome,
  totalExpenses,
  net,
  netIsPositive,
  month,
  year,
}: BalanceCardProps) {
  return (
    <div className="glass rounded-2xl p-4 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      <div className="mb-4 sm:mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Monthly summary
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            {MONTH_NAMES[month - 1]} {year}
          </p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <Wallet className="size-4 text-primary" aria-hidden />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {/* Income */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp
              className="size-3.5 text-[var(--color-success)]"
              aria-hidden
            />
            <p className="text-xs text-muted-foreground">Income</p>
          </div>
          <p className="font-heading text-lg font-bold tabular-nums text-[var(--color-success)]">
            {totalIncome}
          </p>
        </div>

        {/* Expenses */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <TrendingDown
              className="size-3.5 text-[var(--color-error)]"
              aria-hidden
            />
            <p className="text-xs text-muted-foreground">Expenses</p>
          </div>
          <p className="font-heading text-lg font-bold tabular-nums text-[var(--color-error)]">
            {totalExpenses}
          </p>
        </div>

        {/* Net */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Net balance</p>
          <p
            className={cn(
              "font-heading text-lg font-bold tabular-nums",
              netIsPositive
                ? "text-[var(--color-success)]"
                : "text-[var(--color-error)]",
            )}
          >
            {net}
          </p>
        </div>
      </div>
    </div>
  );
}

export function BalanceCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 sm:p-6 animate-pulse">
      <div className="mb-4 sm:mb-5 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-3 w-28 rounded-md bg-muted" />
          <div className="h-4 w-20 rounded-md bg-muted" />
        </div>
        <div className="size-9 rounded-xl bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-16 rounded-md bg-muted" />
            <div className="h-6 w-24 rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
