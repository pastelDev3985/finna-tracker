import { NextResponse } from "next/server"
import { runExchangeRatesRefresh } from "@/lib/exchange-rate-refresh"

function authorizeCron(request: Request): boolean {
  // `next dev`: no Bearer required so a simple browser/curl hit can seed rates locally.
  if (process.env.NODE_ENV !== "production") {
    return true
  }
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return false
  }
  return request.headers.get("authorization") === `Bearer ${secret}`
}

/**
 * Scheduled refresh: ExchangeRate-API → PostgreSQL only when last snapshot is
 * older than 2h (or missing). Never called from user-facing convert routes.
 *
 * Auth: In production, `Authorization: Bearer ${CRON_SECRET}` (Vercel Cron sends this when CRON_SECRET is set). Non-production allows unauthenticated calls for local testing.
 */
export async function GET(request: Request) {
  if (!authorizeCron(request)) {
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
    console.error("[cron/update-rates]", e)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

/** Same as GET — some schedulers default to POST */
export async function POST(request: Request) {
  return GET(request)
}
