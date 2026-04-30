import { ArrowRight, Wallet } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface BudgetStripItem {
  id: string
  categoryName: string
  spentAmount: string
  limitAmount: string
  percentUsed: number
  isOverBudget: boolean
}

interface BudgetHealthStripProps {
  budgets: BudgetStripItem[]
}

export function BudgetHealthStrip({ budgets }: BudgetHealthStripProps) {
  if (budgets.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <SectionHeader />
        <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-8 text-center">
          <Wallet className="size-8 text-muted-foreground" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">No budgets set</p>
            <p className="text-xs text-muted-foreground">
              Add budgets to track your spending limits.
            </p>
          </div>
          <Link
            href="/budgets"
            className="text-xs font-medium text-primary hover:text-primary-hover transition-colors duration-200 cursor-pointer"
          >
            Set your first budget →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6">
      <SectionHeader />
      <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {budgets.map((b) => (
          <Link
            key={b.id}
            href="/budgets"
            className="group min-w-[140px] shrink-0 rounded-xl border border-border bg-muted/40 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted cursor-pointer"
          >
            <p className="mb-2 truncate text-xs font-semibold text-foreground">
              {b.categoryName}
            </p>
            <Progress
              value={Math.min(b.percentUsed, 100)}
              className={cn(
                "h-1.5 rounded-full",
                b.isOverBudget
                  ? "[&>div]:bg-[var(--color-error)]"
                  : b.percentUsed >= 75
                    ? "[&>div]:bg-[var(--color-warning)]"
                    : "[&>div]:bg-[var(--color-success)]"
              )}
            />
            <div className="mt-2 flex items-center justify-between gap-1">
              <span className="text-[11px] tabular-nums text-muted-foreground truncate">
                {b.spentAmount}
              </span>
              <span className="text-[11px] text-muted-foreground">/</span>
              <span className="text-[11px] tabular-nums text-muted-foreground truncate">
                {b.limitAmount}
              </span>
            </div>
            {b.isOverBudget && (
              <span className="mt-1.5 inline-flex items-center rounded-md bg-[var(--color-error)]/10 px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-error)]">
                Over budget
              </span>
            )}
          </Link>
        ))}
      </div>
      <Link
        href="/budgets"
        className="mt-4 flex cursor-pointer items-center gap-1 text-xs font-medium text-primary transition-colors duration-200 hover:text-primary-hover"
      >
        View all budgets
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  )
}

function SectionHeader() {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-heading text-base font-semibold text-foreground">
        Budget health
      </h2>
    </div>
  )
}

export function BudgetHealthStripSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 animate-pulse">
      <div className="h-5 w-28 rounded-md bg-muted mb-4" />
      <div className="flex gap-3 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="min-w-[140px] shrink-0 rounded-xl border border-border p-3 space-y-2">
            <div className="h-3.5 w-20 rounded-md bg-muted" />
            <div className="h-1.5 w-full rounded-full bg-muted" />
            <div className="flex justify-between">
              <div className="h-3 w-12 rounded-md bg-muted" />
              <div className="h-3 w-12 rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
