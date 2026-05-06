import { prisma } from "@/lib/db"
import type { ServiceResult } from "@/types/index"

export interface UserProfileStats {
  memberSince: string
  transactionCount: number
  categoryCount: number
  incomeCategoriesCount: number
  expenseCategoriesCount: number
  goalCount: number
  activeGoalsCount: number
  goalContributionCount: number
  budgetsThisMonthCount: number
}

export async function getUserProfileStats(
  userId: string,
): Promise<ServiceResult<UserProfileStats>> {
  try {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    const [
      user,
      transactionCount,
      categoryCount,
      incomeCategoriesCount,
      expenseCategoriesCount,
      goalCount,
      activeGoalsCount,
      goalContributionCount,
      budgetsThisMonthCount,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      }),
      prisma.transaction.count({ where: { userId } }),
      prisma.category.count({ where: { userId } }),
      prisma.category.count({ where: { userId, type: "INCOME" } }),
      prisma.category.count({ where: { userId, type: "EXPENSE" } }),
      prisma.goal.count({ where: { userId } }),
      prisma.goal.count({ where: { userId, status: "ACTIVE" } }),
      prisma.goalContribution.count({
        where: { goal: { userId } },
      }),
      prisma.budget.count({
        where: { userId, month, year },
      }),
    ])

    if (!user) return { error: "User not found" }

    return {
      data: {
        memberSince: user.createdAt.toISOString(),
        transactionCount,
        categoryCount,
        incomeCategoriesCount,
        expenseCategoriesCount,
        goalCount,
        activeGoalsCount,
        goalContributionCount,
        budgetsThisMonthCount,
      },
    }
  } catch (error) {
    console.error("[getUserProfileStats]", error)
    return { error: "Failed to load stats" }
  }
}
