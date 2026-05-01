import { auth } from "@/lib/auth"
import { formatCurrency, getCurrencySymbol } from "@/lib/currency"
import { listCategories } from "@/lib/services/categories"
import { listBudgets } from "@/lib/services/budgets"
import { BudgetsClient } from "@/components/budgets/budgets-client"

interface Props {
  searchParams: Promise<{ month?: string; year?: string }>
}

export default async function BudgetsPage({ searchParams }: Props) {
  const session = await auth()
  const userId = session!.user.id
  const currency = session!.user.currency ?? "GHS"
  const currencySymbol = getCurrencySymbol(currency)

  const { month: monthStr, year: yearStr } = await searchParams
  const now = new Date()
  const month = Math.min(12, Math.max(1, parseInt(monthStr ?? String(now.getMonth() + 1), 10)))
  const year = parseInt(yearStr ?? String(now.getFullYear()), 10)

  const [budgetsResult, categoriesResult] = await Promise.all([
    listBudgets(userId, month, year),
    listCategories(userId, "EXPENSE"),
  ])

  const budgets = (budgetsResult.data ?? []).map((b) => ({
    id: b.id,
    categoryId: b.categoryId,
    categoryName: b.category.name,
    spentAmount: formatCurrency(b.spentAmount, currency),
    limitAmount: formatCurrency(b.limitAmount, currency),
    limitAmountRaw: b.limitAmount.toNumber().toFixed(2),
    percentUsed: b.percentUsed,
    isOverBudget: b.isOverBudget,
  }))

  const expenseCategories = (categoriesResult.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
  }))

  return (
    <BudgetsClient
      budgets={budgets}
      expenseCategories={expenseCategories}
      currencySymbol={currencySymbol}
      month={month}
      year={year}
    />
  )
}
