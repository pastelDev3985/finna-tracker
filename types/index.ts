import type { TransactionType, GoalStatus, RecurrenceFrequency } from "@/lib/generated/prisma/client"
import type { Decimal } from "@/lib/generated/prisma/internal/prismaNamespace"

// ─── Re-exports ───────────────────────────────────────────────────────────────

export type { TransactionType, GoalStatus, RecurrenceFrequency }

// ─── Service return shapes ────────────────────────────────────────────────────

export type ServiceResult<T> =
  | { data: T; error?: never }
  | { error: string; data?: never }

// ─── Category ─────────────────────────────────────────────────────────────────

export interface CategoryData {
  id: string
  userId: string
  name: string
  type: TransactionType
  icon: string | null
  color: string | null
  createdAt: Date
}

// ─── Transaction ──────────────────────────────────────────────────────────────

export interface TransactionData {
  id: string
  userId: string
  categoryId: string
  type: TransactionType
  amount: Decimal
  note: string | null
  date: Date
  recurrence: RecurrenceFrequency
  createdAt: Date
  updatedAt: Date
  category: CategoryData
}

export interface TransactionSummary {
  totalIncome: Decimal
  totalExpenses: Decimal
  net: Decimal
}

export interface TransactionFilters {
  startDate?: Date
  endDate?: Date
  type?: TransactionType
  categoryId?: string
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export interface BudgetWithSpend {
  id: string
  userId: string
  categoryId: string
  limitAmount: Decimal
  month: number
  year: number
  spentAmount: Decimal
  percentUsed: number
  isOverBudget: boolean
  category: CategoryData
}

// ─── Goal ─────────────────────────────────────────────────────────────────────

export interface GoalData {
  id: string
  userId: string
  name: string
  targetAmount: Decimal
  savedAmount: Decimal
  deadline: Date | null
  status: GoalStatus
  icon: string | null
  createdAt: Date
  updatedAt: Date
}

export interface GoalContributionData {
  id: string
  goalId: string
  amount: Decimal
  note: string | null
  date: Date
  createdAt: Date
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalIncome: Decimal
  totalExpenses: Decimal
  net: Decimal
  month: number
  year: number
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export interface SupportedCurrency {
  code: string
  name: string
  symbol: string
}
