import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { verifyEmailOtp } from "@/lib/services/email-verification"

const Schema = z.object({
  otp: z
    .string()
    .length(6, { error: "Code must be exactly 6 digits" })
    .regex(/^\d+$/, { error: "Code must contain only digits" }),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = Schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors.otp?.[0] ?? "Invalid code" },
        { status: 400 }
      )
    }

    const result = await verifyEmailOtp(session.user.id, parsed.data.otp)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ verified: true }, { status: 200 })
  } catch (error) {
    console.error("[verify-email]", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
