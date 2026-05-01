"use server"

import { auth } from "@/lib/auth"
import { createGoal, updateGoal, deleteGoal, addContribution } from "@/lib/services/goals"
import { revalidatePath } from "next/cache"

export async function createGoalAction(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const result = await createGoal(session.user.id, data)
  if (result.error) return { error: result.error }
  revalidatePath("/goals")
  return {}
}

export async function updateGoalAction(id: string, data: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const result = await updateGoal(session.user.id, id, data)
  if (result.error) return { error: result.error }
  revalidatePath("/goals")
  return {}
}

export async function deleteGoalAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const result = await deleteGoal(session.user.id, id)
  if (result.error) return { error: result.error }
  revalidatePath("/goals")
  return {}
}

export async function addContributionAction(goalId: string, data: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const result = await addContribution(session.user.id, goalId, data)
  if (result.error) return { error: result.error }
  revalidatePath("/goals")
  return {}
}
