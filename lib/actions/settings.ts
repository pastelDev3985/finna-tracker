"use server"

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import {
  updateProfile,
  changePassword,
  updateCurrency,
  deleteAccount,
} from "@/lib/services/settings"

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function updateProfileAction(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const result = await updateProfile(session.user.id, data)
  if (!result.error) revalidatePath("/settings")
  return result
}

// ─── Password ─────────────────────────────────────────────────────────────────

export async function changePasswordAction(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  return changePassword(session.user.id, data)
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export async function updateCurrencyAction(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const result = await updateCurrency(session.user.id, data)
  if (!result.error) {
    // Revalidate all data-heavy pages so amounts re-render with the new symbol
    revalidatePath("/dashboard")
    revalidatePath("/transactions")
    revalidatePath("/budgets")
    revalidatePath("/goals")
    revalidatePath("/reports")
    revalidatePath("/settings")
  }
  return result
}

// ─── Account deletion ─────────────────────────────────────────────────────────

export async function deleteAccountAction(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  return deleteAccount(session.user.id, data)
}
