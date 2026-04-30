import { prisma } from "@/lib/db"
import { Decimal } from "@/lib/generated/prisma/internal/prismaNamespace"
import type { ServiceResult } from "@/types/index"

// ─── Return types ─────────────────────────────────────────────────────────────

export interface CategorySpend {
  categoryId: string
  categoryName: string
  color: string | null
  total: Decimal
}

export interface MonthlyTrend {
  month: number
  year: number
  income: Decimal
  expenses: Decimal
}

export interface DailySpend {
  date: string // "YYYY-MM-DD"
  total: Decimal
}

export interface CategoryBreakdown {
  categoryId: string
  categoryName: string
  color: string | null
  total: Decimal
  percentage: number
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function getMonthlySpendByCategory(
  userId: string,
  month: number,
  year: number
): Promise<ServiceResult<CategorySpend[]>> {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: startDate, lte: endDate },
      },
      select: { amount: true, categoryId: true, category: { select: { name: true, color: true } } },
    })

    const map = new Map<string, CategorySpend>()

    for (const tx of transactions) {
      const existing = map.get(tx.categoryId)
      if (existing) {
        existing.total = existing.total.add(tx.amount)
      } else {
        map.set(tx.categoryId, {
          categoryId: tx.categoryId,
          categoryName: tx.category.name,
          color: tx.category.color,
          total: new Decimal(tx.amount),
        })
      }
    }

    const result = Array.from(map.values()).sort((a, b) =>
      b.total.comparedTo(a.total)
    )

    return { data: result }
  } catch (error) {
    console.error("[getMonthlySpendByCategory]", error)
    return { error: "Failed to fetch category spend" }
  }
}

export async function getIncomeVsExpensesTrend(
  userId: string,
  months = 6
): Promise<ServiceResult<MonthlyTrend[]>> {
  try {
    const now = new Date()
    const result: MonthlyTrend[] = []

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = d.getMonth() + 1
      const year = d.getFullYear()
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59, 999)

      const transactions = await prisma.transaction.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
        select: { type: true, amount: true },
      })

      let income = new Decimal(0)
      let expenses = new Decimal(0)

      for (const tx of transactions) {
        if (tx.type === "INCOME") income = income.add(tx.amount)
        else expenses = expenses.add(tx.amount)
      }

      result.push({ month, year, income, expenses })
    }

    return { data: result }
  } catch (error) {
    console.error("[getIncomeVsExpensesTrend]", error)
    return { error: "Failed to fetch income vs expenses trend" }
  }
}

export async function getDailySpend(
  userId: string,
  month: number,
  year: number
): Promise<ServiceResult<DailySpend[]>> {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: startDate, lte: endDate },
      },
      select: { date: true, amount: true },
    })

    const map = new Map<string, Decimal>()

    for (const tx of transactions) {
      const key = tx.date.toISOString().slice(0, 10) // "YYYY-MM-DD"
      map.set(key, (map.get(key) ?? new Decimal(0)).add(tx.amount))
    }

    const result: DailySpend[] = Array.from(map.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return { data: result }
  } catch (error) {
    console.error("[getDailySpend]", error)
    return { error: "Failed to fetch daily spend" }
  }
}

export async function getCategoryBreakdown(
  userId: string,
  month: number,
  year: number
): Promise<ServiceResult<CategoryBreakdown[]>> {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: startDate, lte: endDate },
      },
      select: { amount: true, categoryId: true, category: { select: { name: true, color: true } } },
    })

    const map = new Map<
      string,
      { categoryName: string; color: string | null; total: Decimal }
    >()

    let grandTotal = new Decimal(0)

    for (const tx of transactions) {
      const existing = map.get(tx.categoryId)
      if (existing) {
        existing.total = existing.total.add(tx.amount)
      } else {
        map.set(tx.categoryId, {
          categoryName: tx.category.name,
          color: tx.category.color,
          total: new Decimal(tx.amount),
        })
      }
      grandTotal = grandTotal.add(tx.amount)
    }

    const result: CategoryBreakdown[] = Array.from(map.entries())
      .map(([categoryId, v]) => ({
        categoryId,
        categoryName: v.categoryName,
        color: v.color,
        total: v.total,
        percentage: grandTotal.equals(0)
          ? 0
          : Math.round(v.total.div(grandTotal).mul(100).toNumber() * 10) / 10,
      }))
      .sort((a, b) => b.total.comparedTo(a.total))

    return { data: result }
  } catch (error) {
    console.error("[getCategoryBreakdown]", error)
    return { error: "Failed to fetch category breakdown" }
  }
}
