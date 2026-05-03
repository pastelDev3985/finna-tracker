import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getLatestRatesPayload } from "@/lib/exchange-rates"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payload = await getLatestRatesPayload()
  if (!payload) {
    // 200 (not 404): empty snapshot is a valid state so dev logs are not confused
    // with a missing route. Clients check `noSnapshot` before reading `rates`.
    return NextResponse.json({
      noSnapshot: true as const,
      message:
        "No exchange rates yet. Use Sync rates on this page, open /api/cron/update-rates once, or wait for cron.",
    })
  }

  return NextResponse.json(payload)
}
