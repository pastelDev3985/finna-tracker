import { prisma } from "@/lib/db"
import { Decimal } from "@/lib/generated/prisma/internal/prismaNamespace"

// ─── Context shape (serialised to JSON for the system prompt) ─────────────────

interface WeeklyEntry {
  month: number
  year: number
  week: number // 1–5 (week of month)
  category: string
  type: "INCOME" | "EXPENSE"
  total: string // Decimal serialised as fixed-point string
}

interface BudgetStatus {
  category: string
  limitAmount: string
  spentAmount: string
  percentUsed: number
  isOverBudget: boolean
}

interface GoalProgress {
  name: string
  targetAmount: string
  savedAmount: string
  percentProgress: number
  deadline: string | null // "YYYY-MM-DD" or null
}

interface InsightsContext {
  user: { name: string; currency: string }
  spendingByWeek: WeeklyEntry[]
  budgets: BudgetStatus[]
  goals: GoalProgress[]
}

// ─── Context builder ──────────────────────────────────────────────────────────

export async function buildInsightsContext(userId: string): Promise<string> {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // ── User ────────────────────────────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, currency: true },
  })

  // ── Last 3 months of transactions (grouped by category + week) ──────────────
  // Go back 3 full months from the start of the current month
  const threeMonthsAgo = new Date(currentYear, currentMonth - 4, 1)
  const periodEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: threeMonthsAgo, lte: periodEnd },
    },
    select: {
      amount: true,
      type: true,
      date: true,
      category: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  })

  // Group by year + month + week-of-month + category + type
  const grouped = new Map<
    string,
    {
      month: number
      year: number
      week: number
      category: string
      type: "INCOME" | "EXPENSE"
      total: Decimal
    }
  >()

  for (const tx of transactions) {
    const d = tx.date
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    const week = Math.min(Math.ceil(d.getDate() / 7), 5)
    const key = `${y}-${m}-W${week}-${tx.category.name}-${tx.type}`

    const existing = grouped.get(key)
    if (existing) {
      existing.total = existing.total.add(tx.amount)
    } else {
      grouped.set(key, {
        month: m,
        year: y,
        week,
        category: tx.category.name,
        type: tx.type as "INCOME" | "EXPENSE",
        total: new Decimal(tx.amount),
      })
    }
  }

  const spendingByWeek: WeeklyEntry[] = Array.from(grouped.values()).map(
    (g) => ({
      month: g.month,
      year: g.year,
      week: g.week,
      category: g.category,
      type: g.type,
      total: g.total.toFixed(2),
    })
  )

  // ── Current month budget statuses ────────────────────────────────────────────
  const monthStart = new Date(currentYear, currentMonth - 1, 1)
  const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999)

  const budgets = await prisma.budget.findMany({
    where: { userId, month: currentMonth, year: currentYear },
    include: { category: true },
  })

  const budgetStatuses: BudgetStatus[] = await Promise.all(
    budgets.map(async (b) => {
      const rows = await prisma.transaction.findMany({
        where: {
          userId,
          categoryId: b.categoryId,
          type: "EXPENSE",
          date: { gte: monthStart, lte: monthEnd },
        },
        select: { amount: true },
      })

      const spent = rows.reduce(
        (sum, r) => sum.add(r.amount),
        new Decimal(0)
      )
      const percentUsed = b.limitAmount.equals(0)
        ? 0
        : Math.round(
            spent.div(b.limitAmount).mul(100).toNumber() * 10
          ) / 10

      return {
        category: b.category.name,
        limitAmount: b.limitAmount.toFixed(2),
        spentAmount: spent.toFixed(2),
        percentUsed,
        isOverBudget: spent.greaterThan(b.limitAmount),
      }
    })
  )

  // ── Active goals ─────────────────────────────────────────────────────────────
  const goals = await prisma.goal.findMany({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  })

  const goalProgress: GoalProgress[] = goals.map((g) => {
    const percent = g.targetAmount.equals(0)
      ? 0
      : Math.round(
          g.savedAmount.div(g.targetAmount).mul(100).toNumber() * 10
        ) / 10
    return {
      name: g.name,
      targetAmount: g.targetAmount.toFixed(2),
      savedAmount: g.savedAmount.toFixed(2),
      percentProgress: percent,
      deadline: g.deadline ? g.deadline.toISOString().slice(0, 10) : null,
    }
  })

  // ── Assemble and serialise ────────────────────────────────────────────────────
  const context: InsightsContext = {
    user: {
      name: user?.name ?? "User",
      currency: user?.currency ?? "GHS",
    },
    spendingByWeek,
    budgets: budgetStatuses,
    goals: goalProgress,
  }

  return JSON.stringify(context)
}
