import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { resendVerificationOtp } from "@/lib/services/email-verification"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await resendVerificationOtp(session.user.id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(
      { message: "A new verification code has been sent to your email." },
      { status: 200 }
    )
  } catch (error) {
    console.error("[resend-otp]", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
