import crypto from "crypto"
import { prisma } from "@/lib/db"
import { sendEmailVerificationOtp, sendWelcomeEmail } from "@/lib/email"
import type { ServiceResult } from "@/types/index"

// ─── Constants ────────────────────────────────────────────────────────────────

const OTP_TTL_MS = 15 * 60 * 1000  // 15 minutes
const OTP_DIGITS = 6

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateOtp(): string {
  // Cryptographically random 6-digit integer (100000–999999, no leading zero issue)
  return crypto.randomInt(100000, 1000000).toString()
}

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex")
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Generate a new OTP for the given user, persist it, and send the verification email.
 * Any previous unused OTP for this user is invalidated first.
 */
export async function sendVerificationOtp(
  userId: string
): Promise<ServiceResult<{ sent: true }>> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, emailVerified: true },
    })
    if (!user) return { error: "User not found" }
    if (user.emailVerified) return { error: "Email is already verified" }

    // Invalidate all previous OTPs for this user
    await prisma.emailVerificationOtp.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    })

    const otp = generateOtp()
    const otpHash = hashOtp(otp)
    const expiresAt = new Date(Date.now() + OTP_TTL_MS)

    await prisma.emailVerificationOtp.create({
      data: { userId, otpHash, expiresAt },
    })

    await sendEmailVerificationOtp({ email: user.email, name: user.name }, otp)
    return { data: { sent: true } }
  } catch (error) {
    console.error("[sendVerificationOtp]", error)
    return { error: "Failed to send verification code" }
  }
}

/**
 * Verify the OTP entered by the user.
 * On success: marks the user as emailVerified and sends a welcome email.
 */
export async function verifyEmailOtp(
  userId: string,
  otp: string
): Promise<ServiceResult<{ verified: true }>> {
  if (!otp || otp.length !== OTP_DIGITS || !/^\d+$/.test(otp)) {
    return { error: "Please enter the 6-digit code from your email" }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, emailVerified: true },
    })
    if (!user) return { error: "User not found" }
    if (user.emailVerified) return { data: { verified: true } } // already done

    // Fetch the latest unused, unexpired OTP
    const record = await prisma.emailVerificationOtp.findFirst({
      where: {
        userId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })

    if (!record) {
      return { error: "No valid code found — please request a new one" }
    }

    const inputHash = hashOtp(otp)
    if (inputHash !== record.otpHash) {
      return { error: "Incorrect code. Please try again" }
    }

    // Atomic: mark user verified + consume OTP
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationOtp.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ])

    // Fire-and-forget welcome email — don't block the response
    sendWelcomeEmail({ email: user.email, name: user.name }).catch((err) =>
      console.error("[verifyEmailOtp/welcome]", err)
    )

    return { data: { verified: true } }
  } catch (error) {
    console.error("[verifyEmailOtp]", error)
    return { error: "Failed to verify code" }
  }
}

/**
 * Resend a fresh OTP to the user.
 * Rate-limited by: only allowed if no valid (unexpired, unused) OTP was
 * sent in the last 60 seconds.
 */
export async function resendVerificationOtp(
  userId: string
): Promise<ServiceResult<{ sent: true }>> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, emailVerified: true },
    })
    if (!user) return { error: "User not found" }
    if (user.emailVerified) return { error: "Email is already verified" }

    // Rate-limit: block resend if an OTP was issued within the last 60 seconds
    const cooldown = new Date(Date.now() - 60 * 1000)
    const recent = await prisma.emailVerificationOtp.findFirst({
      where: {
        userId,
        usedAt: null,
        expiresAt: { gt: new Date() },
        createdAt: { gt: cooldown },
      },
    })
    if (recent) {
      return { error: "Please wait 60 seconds before requesting a new code" }
    }

    return sendVerificationOtp(userId)
  } catch (error) {
    console.error("[resendVerificationOtp]", error)
    return { error: "Failed to resend verification code" }
  }
}
