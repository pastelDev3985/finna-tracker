import { EXCHANGE_RATE_REFRESH_MS } from "@/lib/exchange-rate-core"
import { prisma } from "@/lib/db"
import {
  shouldSkipProviderFetch,
  fetchRatesFromProvider,
  saveRatesSnapshot,
} from "@/lib/exchange-rates"

export type ExchangeRatesRefreshResult =
  | { kind: "skipped"; lastFetchedAt: string }
  | {
      kind: "updated"
      id: string
      fetchedAt: string
      currencies: number
    }

export interface RunExchangeRatesRefreshOptions {
  /** Defaults to {@link EXCHANGE_RATE_REFRESH_MS} (cron). Signed-in sync uses 24h. */
  minIntervalMs?: number
}

/** Shared logic for Vercel cron and authenticated user “Sync”. */
export async function runExchangeRatesRefresh(
  options: RunExchangeRatesRefreshOptions = {},
): Promise<ExchangeRatesRefreshResult> {
  const minIntervalMs = options.minIntervalMs ?? EXCHANGE_RATE_REFRESH_MS

  const latest = await prisma.exchangeRateSnapshot.findFirst({
    orderBy: { fetchedAt: "desc" },
    select: { fetchedAt: true },
  })

  if (shouldSkipProviderFetch(latest?.fetchedAt ?? null, minIntervalMs)) {
    return {
      kind: "skipped",
      lastFetchedAt: latest!.fetchedAt.toISOString(),
    }
  }

  const { rates } = await fetchRatesFromProvider()
  const { id, fetchedAt } = await saveRatesSnapshot(rates)

  return {
    kind: "updated",
    id,
    fetchedAt: fetchedAt.toISOString(),
    currencies: Object.keys(rates).length,
  }
}
