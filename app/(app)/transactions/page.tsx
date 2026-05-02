import { Plus } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { formatCurrency, getCurrencySymbol } from "@/lib/currency"
import { listCategories } from "@/lib/services/categories"
import { listTransactions } from "@/lib/services/transactions"
import { PageHeader } from "@/components/shared/page-header"
import { TransactionList } from "@/components/transactions/transaction-list"
import { TransactionSortBar } from "@/components/transactions/transaction-sort-bar"
import {
  parseTransactionSort,
  transactionsListHref,
} from "@/lib/transactions-sort"

interface Props {
  searchParams: Promise<{ page?: string; sort?: string }>
}

export default async function TransactionsPage({ searchParams }: Props) {
  const session = await auth()
  const userId = session!.user.id
  const currency = session!.user.currency ?? "GHS"
  const currencySymbol = getCurrencySymbol(currency)

  const { page: pageStr, sort: sortRaw } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? "1", 10))
  const sort = parseTransactionSort(sortRaw)

  const [txResult, catResult] = await Promise.all([
    listTransactions(userId, { page, limit: 25, sort }),
    listCategories(userId),
  ])

  const paginated = txResult.data
  const categories = (catResult.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type as "INCOME" | "EXPENSE",
  }))

  const rows = (paginated?.data ?? []).map((tx) => ({
    id: tx.id,
    categoryId: tx.categoryId,
    categoryName: tx.category.name,
    type: tx.type as "INCOME" | "EXPENSE",
    amount: formatCurrency(tx.amount, currency),
    rawAmount: tx.amount.toString(),
    date: new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(tx.date)),
    rawDate: new Date(tx.date).toISOString().slice(0, 10),
    note: tx.note,
    recurrence: tx.recurrence,
  }))

  const total = paginated?.total ?? 0
  const totalPages = paginated?.totalPages ?? 1

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
      <PageHeader
        title="Transactions"
        description={`${total} transaction${total !== 1 ? "s" : ""} recorded`}
        action={
          <Link
            href="/transactions/new"
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:-translate-y-px hover:bg-primary-hover active:translate-y-0 active:bg-primary-active active:scale-[0.97] sm:rounded-lg"
          >
            <Plus className="size-4" aria-hidden />
            <span>Add</span>
          </Link>
        }
      />

      <TransactionSortBar currentSort={sort} />

      <TransactionList
        transactions={rows}
        categories={categories}
        currencySymbol={currencySymbol}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={transactionsListHref(page - 1, sort)}
                className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-sm transition-all duration-150 hover:bg-muted hover:text-foreground active:bg-muted/80 active:scale-[0.98]"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={transactionsListHref(page + 1, sort)}
                className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-sm transition-all duration-150 hover:bg-muted hover:text-foreground active:bg-muted/80 active:scale-[0.98]"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
