import { Plus } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { formatCurrency, getCurrencySymbol } from "@/lib/currency"
import { listCategories } from "@/lib/services/categories"
import { listTransactions } from "@/lib/services/transactions"
import { PageHeader } from "@/components/shared/page-header"
import { TransactionList } from "@/components/transactions/transaction-list"

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function TransactionsPage({ searchParams }: Props) {
  const session = await auth()
  const userId = session!.user.id
  const currency = session!.user.currency ?? "GHS"
  const currencySymbol = getCurrencySymbol(currency)

  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? "1", 10))

  const [txResult, catResult] = await Promise.all([
    listTransactions(userId, { page, limit: 25 }),
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
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Transactions"
        description={`${total} transaction${total !== 1 ? "s" : ""} recorded`}
        action={
          <Link
            href="/transactions/new"
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-px hover:bg-primary-hover"
          >
            <Plus className="size-4" aria-hidden />
            Add
          </Link>
        }
      />

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
                href={`/transactions?page=${page - 1}`}
                className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-sm transition-all duration-200 hover:bg-muted hover:text-foreground"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/transactions?page=${page + 1}`}
                className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-sm transition-all duration-200 hover:bg-muted hover:text-foreground"
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
