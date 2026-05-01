import { auth } from "@/lib/auth"
import { getCurrencySymbol } from "@/lib/currency"
import { listCategories } from "@/lib/services/categories"
import { PageHeader } from "@/components/shared/page-header"
import { TransactionForm } from "@/components/transactions/transaction-form"

export default async function NewTransactionPage() {
  const session = await auth()
  const userId = session!.user.id
  const currency = session!.user.currency ?? "GHS"
  const currencySymbol = getCurrencySymbol(currency)

  const categoriesResult = await listCategories(userId)
  const categories = (categoriesResult.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type as "INCOME" | "EXPENSE",
  }))

  return (
    <div className="mx-auto max-w-lg p-6 lg:p-8">
      <PageHeader
        title="Add transaction"
        description="Record an income or expense entry."
        className="mb-6"
      />
      <div className="glass rounded-2xl p-6">
        <TransactionForm
          categories={categories}
          currencySymbol={currencySymbol}
          mode="create"
        />
      </div>
    </div>
  )
}
