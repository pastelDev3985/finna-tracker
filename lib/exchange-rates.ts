export {
  EXCHANGE_RATE_STORED_BASE,
  EXCHANGE_RATE_REFRESH_MS,
  POPULAR_CONVERSION_TARGETS,
  type RatesMap,
  type LatestRatesPayload,
  parseRatesJson,
  convertAmount,
} from "@/lib/exchange-rate-core"

import type { InputJsonValue } from "@/lib/generated/prisma/internal/prismaNamespace"
import { prisma } from "@/lib/db"
import {
  EXCHANGE_RATE_REFRESH_MS,
  EXCHANGE_RATE_STORED_BASE,
  parseRatesJson,
  type LatestRatesPayload,
  type RatesMap,
} from "@/lib/exchange-rate-core"

export async function getLatestRatesPayload(): Promise<LatestRatesPayload | null> {
  const row = await (prisma as any).exchangeRateSnapshot.findFirst({
    orderBy: { fetchedAt: "desc" },
  })
  if (!row) return null
  return {
    baseCurrency: row.baseCurrency,
    fetchedAt: row.fetchedAt.toISOString(),
    rates: parseRatesJson(row.ratesJson),
  }
}

interface ProviderSuccess {
  rates: RatesMap
  providerUpdatedUnix: number | null
}

/** Fetch latest rates from ExchangeRate-API (v6 standard, base GHS). */
export async function fetchRatesFromProvider(): Promise<ProviderSuccess> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY
  if (!apiKey?.trim()) {
    throw new Error("EXCHANGE_RATE_API_KEY is not configured")
  }

  const base = EXCHANGE_RATE_STORED_BASE
  const url = `https://v6.exchangerate-api.com/v6/${apiKey.trim()}/latest/${base}`

  const res = await fetch(url, {
    next: { revalidate: 0 },
    headers: { Accept: "application/json" },
  })

  if (!res.ok) {
    throw new Error(`Exchange rate API HTTP ${res.status}`)
  }

  const data = (await res.json()) as Record<string, unknown>

  if (data.result === "error") {
    const errType = data["error-type"] ?? "unknown"
    throw new Error(`Exchange rate API error: ${String(errType)}`)
  }

  const conversionRates = data.conversion_rates as Record<
    string,
    unknown
  > | null
  if (!conversionRates || typeof conversionRates !== "object") {
    throw new Error("Invalid API response: missing conversion_rates")
  }

  const rates: RatesMap = {}
  for (const [k, v] of Object.entries(conversionRates)) {
    if (typeof v === "number" && Number.isFinite(v)) {
      rates[k.trim().toUpperCase()] = v
    }
  }
  rates[EXCHANGE_RATE_STORED_BASE] = 1

  const unix = data.time_last_update_unix
  const providerUpdatedUnix =
    typeof unix === "number" && Number.isFinite(unix) ? unix : null

  return { rates, providerUpdatedUnix }
}

/** Insert a new snapshot row (append-only). */
export async function saveRatesSnapshot(
  rates: RatesMap,
): Promise<{ id: string; fetchedAt: Date }> {
  const row = await (prisma as any).exchangeRateSnapshot.create({
    data: {
      baseCurrency: EXCHANGE_RATE_STORED_BASE,
      ratesJson: rates as InputJsonValue,
      fetchedAt: new Date(),
    },
  })
  return { id: row.id, fetchedAt: row.fetchedAt }
}

export function shouldSkipProviderFetch(lastFetchedAt: Date | null): boolean {
  if (!lastFetchedAt) return false
  return Date.now() - lastFetchedAt.getTime() < EXCHANGE_RATE_REFRESH_MS
}
