import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { sendVerificationOtp } from "@/lib/services/email-verification"

const RegisterSchema = z.object({
  name: z.string().min(2, { error: "Name must be at least 2 characters" }).trim(),
  email: z.email({ error: "Please enter a valid email address" }).trim(),
  password: z.string().min(8, { error: "Password must be at least 8 characters" }),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = RegisterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: false, // must complete OTP verification before accessing the app
      },
      select: { id: true },
    })

    // Send OTP — fire-and-forget; do not fail registration if email delivery fails
    sendVerificationOtp(user.id).catch((err) =>
      console.error("[register/sendVerificationOtp]", err)
    )

    return NextResponse.json(
      { success: true, requiresEmailVerification: true },
      { status: 201 }
    )
  } catch (error) {
    console.error("[register]", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
