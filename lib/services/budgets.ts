import { z } from "zod"
import { prisma } from "@/lib/db"
import { Decimal } from "@/lib/generated/prisma/internal/prismaNamespace"
import type { ServiceResult, BudgetWithSpend } from "@/types/index"

// ─── Schemas ──────────────────────────────────────────────────────────────────

const UpsertBudgetSchema = z.object({
  categoryId: z.string().min(1, { error: "Category is required" }),
  limitAmount: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      error: "Limit must be a positive number",
    }),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
})

// ─── Helper: EXPENSE totals per category for one calendar month (single query) ─

export async function sumExpensesByCategoryIds(
  userId: string,
  categoryIds: string[],
  month: number,
  year: number
): Promise<Map<string, Decimal>> {
  const map = new Map<string, Decimal>()
  if (categoryIds.length === 0) return map

  const uniqueIds = [...new Set(categoryIds)]
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      categoryId: { in: uniqueIds },
      date: { gte: startDate, lte: endDate },
    },
    select: { categoryId: true, amount: true },
  })

  for (const r of rows) {
    map.set(
      r.categoryId,
      (map.get(r.categoryId) ?? new Decimal(0)).add(r.amount)
    )
  }
  return map
}

async function computeSpent(
  userId: string,
  categoryId: string,
  month: number,
  year: number
): Promise<Decimal> {
  const byCat = await sumExpensesByCategoryIds(
    userId,
    [categoryId],
    month,
    year
  )
  return byCat.get(categoryId) ?? new Decimal(0)
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function listBudgets(
  userId: string,
  month: number,
  year: number
): Promise<ServiceResult<BudgetWithSpend[]>> {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: true },
      orderBy: { category: { name: "asc" } },
    })

    const spentByCategory = await sumExpensesByCategoryIds(
      userId,
      budgets.map((b) => b.categoryId),
      month,
      year
    )

    const withSpend: BudgetWithSpend[] = budgets.map((b) => {
      const spentAmount =
        spentByCategory.get(b.categoryId) ?? new Decimal(0)
      const percentUsed = b.limitAmount.equals(0)
        ? 0
        : spentAmount.div(b.limitAmount).mul(100).toNumber()

      return {
        ...b,
        spentAmount,
        percentUsed: Math.round(percentUsed * 10) / 10,
        isOverBudget: spentAmount.greaterThan(b.limitAmount),
      }
    })

    return { data: withSpend }
  } catch (error) {
    console.error("[listBudgets]", error)
    return { error: "Failed to fetch budgets" }
  }
}

export async function getBudgetWithSpend(
  userId: string,
  categoryId: string,
  month: number,
  year: number
): Promise<ServiceResult<BudgetWithSpend | null>> {
  try {
    const budget = await prisma.budget.findUnique({
      where: { userId_categoryId_month_year: { userId, categoryId, month, year } },
      include: { category: true },
    })

    if (!budget) return { data: null }

    const spentAmount = await computeSpent(userId, categoryId, month, year)
    const percentUsed = budget.limitAmount.equals(0)
      ? 0
      : spentAmount.div(budget.limitAmount).mul(100).toNumber()

    return {
      data: {
        ...budget,
        spentAmount,
        percentUsed: Math.round(percentUsed * 10) / 10,
        isOverBudget: spentAmount.greaterThan(budget.limitAmount),
      },
    }
  } catch (error) {
    console.error("[getBudgetWithSpend]", error)
    return { error: "Failed to fetch budget" }
  }
}

export async function upsertBudget(
  userId: string,
  data: unknown
): Promise<ServiceResult<BudgetWithSpend>> {
  const parsed = UpsertBudgetSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }

  const { categoryId, limitAmount, month, year } = parsed.data

  try {
    const budget = await prisma.budget.upsert({
      where: { userId_categoryId_month_year: { userId, categoryId, month, year } },
      update: { limitAmount: new Decimal(limitAmount) },
      create: {
        userId,
        categoryId,
        limitAmount: new Decimal(limitAmount),
        month,
        year,
      },
      include: { category: true },
    })

    const spentAmount = await computeSpent(userId, categoryId, month, year)
    const percentUsed = budget.limitAmount.equals(0)
      ? 0
      : spentAmount.div(budget.limitAmount).mul(100).toNumber()

    return {
      data: {
        ...budget,
        spentAmount,
        percentUsed: Math.round(percentUsed * 10) / 10,
        isOverBudget: spentAmount.greaterThan(budget.limitAmount),
      },
    }
  } catch (error) {
    console.error("[upsertBudget]", error)
    return { error: "Failed to save budget" }
  }
}

export async function deleteBudget(
  userId: string,
  id: string
): Promise<ServiceResult<{ id: string }>> {
  try {
    await prisma.budget.delete({ where: { id, userId } })
    return { data: { id } }
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return { error: "Budget not found" }
    }
    console.error("[deleteBudget]", error)
    return { error: "Failed to delete budget" }
  }
}
