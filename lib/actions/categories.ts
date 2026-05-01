"use server"

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/services/categories"

// ─── Create Category ──────────────────────────────────────────────────────────

export async function createCategoryAction(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const result = await createCategory(session.user.id, data)
  if (!result.error) revalidatePath("/settings")
  return result
}

// ─── Update Category ──────────────────────────────────────────────────────────

export async function updateCategoryAction(id: string, data: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const result = await updateCategory(session.user.id, id, data)
  if (!result.error) revalidatePath("/settings")
  return result
}

// ─── Delete Category ──────────────────────────────────────────────────────────

export async function deleteCategoryAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const result = await deleteCategory(session.user.id, id)
  if (!result.error) revalidatePath("/settings")
  return result
}
