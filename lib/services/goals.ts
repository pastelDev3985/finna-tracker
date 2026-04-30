import { z } from "zod"
import { prisma } from "@/lib/db"
import { Decimal } from "@/lib/generated/prisma/internal/prismaNamespace"
import type {
  ServiceResult,
  GoalData,
  GoalContributionData,
} from "@/types/index"

// ─── Schemas ──────────────────────────────────────────────────────────────────

const CreateGoalSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }).trim(),
  targetAmount: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      error: "Target amount must be a positive number",
    }),
  deadline: z.coerce.date().optional(),
  icon: z.string().optional(),
})

const UpdateGoalSchema = CreateGoalSchema.partial().extend({
  status: z.enum(["ACTIVE", "COMPLETED", "PAUSED"]).optional(),
})

const AddContributionSchema = z.object({
  amount: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      error: "Amount must be a positive number",
    }),
  note: z.string().trim().optional(),
  date: z.coerce.date(),
})

// ─── Extended types ───────────────────────────────────────────────────────────

export interface GoalWithContributions extends GoalData {
  contributions: GoalContributionData[]
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function listGoals(
  userId: string
): Promise<ServiceResult<GoalData[]>> {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })
    return { data: goals as GoalData[] }
  } catch (error) {
    console.error("[listGoals]", error)
    return { error: "Failed to fetch goals" }
  }
}

export async function getGoalById(
  userId: string,
  id: string
): Promise<ServiceResult<GoalWithContributions>> {
  try {
    const goal = await prisma.goal.findUnique({
      where: { id, userId },
      include: {
        contributions: { orderBy: { date: "desc" } },
      },
    })

    if (!goal) return { error: "Goal not found" }
    return { data: goal as GoalWithContributions }
  } catch (error) {
    console.error("[getGoalById]", error)
    return { error: "Failed to fetch goal" }
  }
}

export async function createGoal(
  userId: string,
  data: unknown
): Promise<ServiceResult<GoalData>> {
  const parsed = CreateGoalSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }

  try {
    const goal = await prisma.goal.create({
      data: {
        ...parsed.data,
        targetAmount: new Decimal(parsed.data.targetAmount),
        userId,
      },
    })
    return { data: goal as GoalData }
  } catch (error) {
    console.error("[createGoal]", error)
    return { error: "Failed to create goal" }
  }
}

export async function updateGoal(
  userId: string,
  id: string,
  data: unknown
): Promise<ServiceResult<GoalData>> {
  const parsed = UpdateGoalSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }

  try {
    const goal = await prisma.goal.update({
      where: { id, userId },
      data: {
        ...parsed.data,
        ...(parsed.data.targetAmount
          ? { targetAmount: new Decimal(parsed.data.targetAmount) }
          : {}),
      },
    })
    return { data: goal as GoalData }
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return { error: "Goal not found" }
    }
    console.error("[updateGoal]", error)
    return { error: "Failed to update goal" }
  }
}

export async function deleteGoal(
  userId: string,
  id: string
): Promise<ServiceResult<{ id: string }>> {
  try {
    await prisma.goal.delete({ where: { id, userId } })
    return { data: { id } }
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return { error: "Goal not found" }
    }
    console.error("[deleteGoal]", error)
    return { error: "Failed to delete goal" }
  }
}

export async function addContribution(
  userId: string,
  goalId: string,
  data: unknown
): Promise<ServiceResult<GoalContributionData>> {
  const parsed = AddContributionSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }

  // Verify the goal belongs to this user
  const goal = await prisma.goal.findUnique({
    where: { id: goalId, userId },
    select: { id: true, savedAmount: true, targetAmount: true },
  })
  if (!goal) return { error: "Goal not found" }

  const contributionAmount = new Decimal(parsed.data.amount)
  const newSavedAmount = goal.savedAmount.add(contributionAmount)
  const isCompleted = newSavedAmount.greaterThanOrEqualTo(goal.targetAmount)

  try {
    // Atomic: insert contribution + update savedAmount (+ auto-complete) in one transaction
    const [contribution] = await prisma.$transaction([
      prisma.goalContribution.create({
        data: {
          goalId,
          amount: contributionAmount,
          note: parsed.data.note,
          date: parsed.data.date,
        },
      }),
      prisma.goal.update({
        where: { id: goalId },
        data: {
          savedAmount: newSavedAmount,
          ...(isCompleted ? { status: "COMPLETED" } : {}),
        },
      }),
    ])

    return { data: contribution as GoalContributionData }
  } catch (error) {
    console.error("[addContribution]", error)
    return { error: "Failed to add contribution" }
  }
}
