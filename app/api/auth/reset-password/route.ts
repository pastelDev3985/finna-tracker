import { NextResponse } from "next/server"
import { resetPassword, validateResetToken } from "@/lib/services/password-reset"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await resetPassword(body)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[reset-password/POST]", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/reset-password?token=<rawToken>
 * Used by the frontend to validate the token before showing the reset form.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const result = await validateResetToken(token)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ valid: true }, { status: 200 })
  } catch (error) {
    console.error("[reset-password/GET]", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
