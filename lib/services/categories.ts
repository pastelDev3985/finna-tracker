import { z } from "zod"
import { prisma } from "@/lib/db"
import type { TransactionType } from "@/lib/generated/prisma/client"
import type { ServiceResult, CategoryData } from "@/types/index"

// ─── Schemas ──────────────────────────────────────────────────────────────────

const CreateCategorySchema = z.object({
  name: z.string().min(1, { error: "Name is required" }).trim(),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.string().optional(),
  color: z.string().optional(),
})

const UpdateCategorySchema = CreateCategorySchema.partial()

// ─── Default categories seeded for every new user ────────────────────────────

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary",        icon: "briefcase",   color: "#22c55e" },
  { name: "Freelance",     icon: "laptop",      color: "#16a34a" },
  { name: "Business",      icon: "building-2",  color: "#15803d" },
  { name: "Investment",    icon: "trending-up", color: "#166534" },
  { name: "Other Income",  icon: "plus-circle", color: "#14532d" },
] as const

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Food & Drink",      icon: "utensils",       color: "#f04438" },
  { name: "Transport",         icon: "car",             color: "#ef4444" },
  { name: "Housing",           icon: "home",            color: "#dc2626" },
  { name: "Utilities",         icon: "zap",             color: "#b91c1c" },
  { name: "Healthcare",        icon: "heart-pulse",     color: "#991b1b" },
  { name: "Shopping",          icon: "shopping-bag",    color: "#f97316" },
  { name: "Entertainment",     icon: "tv",              color: "#ea580c" },
  { name: "Education",         icon: "graduation-cap",  color: "#c2410c" },
  { name: "Savings Transfer",  icon: "piggy-bank",      color: "#FFD100" },
  { name: "Other",             icon: "more-horizontal", color: "#737373" },
] as const

// ─── Service functions ────────────────────────────────────────────────────────

export async function seedDefaultCategories(userId: string): Promise<void> {
  const income = DEFAULT_INCOME_CATEGORIES.map((c) => ({
    ...c,
    userId,
    type: "INCOME" as TransactionType,
  }))

  const expense = DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
    ...c,
    userId,
    type: "EXPENSE" as TransactionType,
  }))

  await prisma.category.createMany({
    data: [...income, ...expense],
    skipDuplicates: true,
  })
}

export async function listCategories(
  userId: string,
  type?: TransactionType
): Promise<ServiceResult<CategoryData[]>> {
  try {
    const categories = await prisma.category.findMany({
      where: { userId, ...(type ? { type } : {}) },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    })
    return { data: categories }
  } catch (error) {
    console.error("[listCategories]", error)
    return { error: "Failed to fetch categories" }
  }
}

export async function createCategory(
  userId: string,
  data: unknown
): Promise<ServiceResult<CategoryData>> {
  const parsed = CreateCategorySchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }

  try {
    const category = await prisma.category.create({
      data: { ...parsed.data, userId },
    })
    return { data: category }
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { error: "A category with this name already exists" }
    }
    console.error("[createCategory]", error)
    return { error: "Failed to create category" }
  }
}

export async function updateCategory(
  userId: string,
  id: string,
  data: unknown
): Promise<ServiceResult<CategoryData>> {
  const parsed = UpdateCategorySchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }

  try {
    const category = await prisma.category.update({
      where: { id, userId },
      data: parsed.data,
    })
    return { data: category }
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return { error: "Category not found" }
    }
    console.error("[updateCategory]", error)
    return { error: "Failed to update category" }
  }
}

export async function deleteCategory(
  userId: string,
  id: string
): Promise<ServiceResult<{ id: string }>> {
  try {
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id, userId },
    })

    if (transactionCount > 0) {
      return {
        error: `Cannot delete — this category has ${transactionCount} transaction${transactionCount === 1 ? "" : "s"} linked to it`,
      }
    }

    await prisma.category.delete({ where: { id, userId } })
    return { data: { id } }
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return { error: "Category not found" }
    }
    console.error("[deleteCategory]", error)
    return { error: "Failed to delete category" }
  }
}
