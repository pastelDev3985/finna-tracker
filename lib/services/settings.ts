import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { SUPPORTED_CURRENCIES } from "@/lib/currency"
import type { ServiceResult } from "@/types/index"

// ─── Schemas ───────────────────────────────────────────────────────────────────

const UpdateProfileSchema = z.object({
  name: z.string().min(2, { error: "Name must be at least 2 characters" }).trim(),
  email: z.email({ error: "Please enter a valid email address" }).trim(),
})

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { error: "New password must be at least 8 characters" }),
    confirmPassword: z.string().min(1, { error: "Please confirm your new password" }),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  })

const UpdateCurrencySchema = z.object({
  currency: z.string().min(1, { error: "Currency code is required" }),
})

const DeleteAccountSchema = z.object({
  password: z.string().min(1, { error: "Password is required" }),
})

// ─── Shared user-row type ──────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  name: string
  email: string
  currency: string
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function updateProfile(
  userId: string,
  data: unknown
): Promise<ServiceResult<UserProfile>> {
  const parsed = UpdateProfileSchema.safeParse(data)
  if (!parsed.success) {
    const first = parsed.error.flatten().formErrors[0]
      ?? Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
      ?? "Invalid input"
    return { error: first }
  }

  const { name, email } = parsed.data

  try {
    // Check email uniqueness — skip if email is unchanged
    const conflict = await prisma.user.findFirst({
      where: { email, NOT: { id: userId } },
      select: { id: true },
    })
    if (conflict) {
      return { error: "That email address is already in use by another account" }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: { id: true, name: true, email: true, currency: true },
    })

    return { data: user }
  } catch (error) {
    console.error("[updateProfile]", error)
    return { error: "Failed to update profile" }
  }
}

export async function changePassword(
  userId: string,
  data: unknown
): Promise<ServiceResult<{ success: true }>> {
  const parsed = ChangePasswordSchema.safeParse(data)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    const first =
      fieldErrors.currentPassword?.[0] ??
      fieldErrors.newPassword?.[0] ??
      fieldErrors.confirmPassword?.[0] ??
      parsed.error.flatten().formErrors[0] ??
      "Invalid input"
    return { error: first }
  }

  const { currentPassword, newPassword } = parsed.data

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })
    if (!user) return { error: "User not found" }

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return { error: "Current password is incorrect" }

    if (currentPassword === newPassword) {
      return { error: "New password must be different from your current password" }
    }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } })

    return { data: { success: true } }
  } catch (error) {
    console.error("[changePassword]", error)
    return { error: "Failed to change password" }
  }
}

export async function updateCurrency(
  userId: string,
  data: unknown
): Promise<ServiceResult<{ currency: string }>> {
  const parsed = UpdateCurrencySchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }

  const { currency } = parsed.data

  const supported = SUPPORTED_CURRENCIES.some((c) => c.code === currency)
  if (!supported) {
    return { error: `"${currency}" is not a supported currency` }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { currency },
    })
    return { data: { currency } }
  } catch (error) {
    console.error("[updateCurrency]", error)
    return { error: "Failed to update currency" }
  }
}

export async function deleteAccount(
  userId: string,
  data: unknown
): Promise<ServiceResult<{ deleted: true }>> {
  const parsed = DeleteAccountSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" }
  }

  const { password } = parsed.data

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })
    if (!user) return { error: "User not found" }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return { error: "Incorrect password" }

    // Cascades all related data via schema onDelete: Cascade
    await prisma.user.delete({ where: { id: userId } })

    return { data: { deleted: true } }
  } catch (error) {
    console.error("[deleteAccount]", error)
    return { error: "Failed to delete account" }
  }
}
