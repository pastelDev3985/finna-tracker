import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { runExchangeRatesRefresh } from "@/lib/exchange-rate-refresh"

/** Signed-in manual refresh (browser can call this; cron uses Bearer secret). */
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await runExchangeRatesRefresh()
    if (result.kind === "skipped") {
      return NextResponse.json({
        skipped: true,
        reason: "fresh_enough",
        lastFetchedAt: result.lastFetchedAt,
      })
    }
    return NextResponse.json({
      ok: true,
      id: result.id,
      fetchedAt: result.fetchedAt,
      currencies: result.currencies,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed"
    console.error("[rates/sync]", e)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
