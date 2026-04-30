import { ArrowLeftRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface RecentTxItem {
  id: string
  categoryName: string
  note: string | null
  date: string
  amount: string
  type: "INCOME" | "EXPENSE"
}

interface RecentTransactionsProps {
  transactions: RecentTxItem[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <SectionHeader />
        <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-8 text-center">
          <ArrowLeftRight className="size-8 text-muted-foreground" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground">
              Add your first transaction to start tracking.
            </p>
          </div>
          <Link
            href="/transactions/new"
            className="text-xs font-medium text-primary hover:text-primary-hover transition-colors duration-200 cursor-pointer"
          >
            Add transaction →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6">
      <SectionHeader />
      <div className="mt-4 divide-y divide-border">
        {transactions.map((tx) => (
          <Link
            key={tx.id}
            href="/transactions"
            className="group flex cursor-pointer items-center gap-3 py-3 transition-all duration-200 first:pt-0 last:pb-0 hover:opacity-80"
          >
            {/* Category pill */}
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                tx.type === "INCOME"
                  ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                  : "bg-[var(--color-error)]/10 text-[var(--color-error)]"
              )}
              aria-hidden
            >
              {tx.type === "INCOME" ? "+" : "-"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {tx.categoryName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {tx.note ?? tx.date}
              </p>
            </div>

            <span
              className={cn(
                "shrink-0 text-sm font-semibold tabular-nums",
                tx.type === "INCOME"
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-error)]"
              )}
            >
              {tx.type === "INCOME" ? "+" : "-"}{tx.amount}
            </span>
          </Link>
        ))}
      </div>
      <Link
        href="/transactions"
        className="mt-4 flex cursor-pointer items-center gap-1 text-xs font-medium text-primary transition-colors duration-200 hover:text-primary-hover"
      >
        View all transactions
        <span aria-hidden className="ml-0.5">→</span>
      </Link>
    </div>
  )
}

function SectionHeader() {
  return (
    <h2 className="font-heading text-base font-semibold text-foreground">
      Recent transactions
    </h2>
  )
}

export function RecentTransactionsSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 animate-pulse">
      <div className="h-5 w-40 rounded-md bg-muted mb-4" />
      <div className="divide-y divide-border">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div className="size-9 shrink-0 rounded-xl bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-28 rounded-md bg-muted" />
              <div className="h-3 w-20 rounded-md bg-muted" />
            </div>
            <div className="h-4 w-16 rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
