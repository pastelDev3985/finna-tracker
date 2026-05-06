import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { EXCHANGE_RATE_MANUAL_SYNC_COOLDOWN_MS } from "@/lib/exchange-rate-core"
import { runExchangeRatesRefresh } from "@/lib/exchange-rate-refresh"

/** Signed-in manual refresh — global cooldown from latest DB `fetchedAt` (all users share one snapshot). */
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await runExchangeRatesRefresh({
      minIntervalMs: EXCHANGE_RATE_MANUAL_SYNC_COOLDOWN_MS,
    })
    if (result.kind === "skipped") {
      const lastMs = new Date(result.lastFetchedAt).getTime()
      const nextSyncAvailableAt = new Date(
        lastMs + EXCHANGE_RATE_MANUAL_SYNC_COOLDOWN_MS,
      ).toISOString()
      return NextResponse.json({
        skipped: true,
        reason: "manual_cooldown",
        lastFetchedAt: result.lastFetchedAt,
        nextSyncAvailableAt,
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
