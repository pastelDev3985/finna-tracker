/** Pure FX helpers + constants (safe for client bundles — no Prisma). */

/** Stored snapshot base — all `rates[X]` are “units of X per 1 GHS”. */
export const EXCHANGE_RATE_STORED_BASE = "GHS" as const

/** Minimum interval between upstream API calls (cron / manual refresh). */
export const EXCHANGE_RATE_REFRESH_MS = 2 * 60 * 60 * 1000

/** Curated list for “common conversions” UI (paginated). Order is stable. */
export const POPULAR_CONVERSION_TARGETS = [
  "USD",
  "EUR",
  "GBP",
  "NGN",
  "KES",
  "ZAR",
  "XOF",
  "CAD",
  "AUD",
  "JPY",
  "CHF",
  "INR",
  "CNY",
  "AED",
  "SAR",
  "EGP",
  "MAD",
  "TRY",
  "BRL",
  "MXN",
  "HKD",
  "SGD",
  "SEK",
  "NOK",
  "DKK",
  "UGX",
  "TZS",
  "ETB",
  "RUB",
  "NZD",
] as const

export type RatesMap = Record<string, number>

export interface LatestRatesPayload {
  baseCurrency: string
  fetchedAt: string
  rates: RatesMap
}

function normCode(code: string): string {
  return code.trim().toUpperCase()
}

/**
 * For controlled money inputs: keep only digits and at most one '.'.
 * Strips commas, signs, letters, and extra decimals.
 */
export function sanitizeAmountInput(raw: string): string {
  let sawDot = false
  let out = ""
  for (const ch of raw) {
    if (ch >= "0" && ch <= "9") {
      out += ch
    } else if (ch === "." && !sawDot) {
      sawDot = true
      out += ch
    }
  }
  return out
}

/** Parse JSON snapshot into a numeric rates map; drops invalid entries. */
export function parseRatesJson(raw: unknown): RatesMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const out: RatesMap = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "number" && Number.isFinite(v)) {
      out[normCode(k)] = v
    } else if (typeof v === "string" && v !== "" && !isNaN(Number(v))) {
      const n = Number(v)
      if (Number.isFinite(n)) out[normCode(k)] = n
    }
  }
  if (out[EXCHANGE_RATE_STORED_BASE] === undefined) {
    out[EXCHANGE_RATE_STORED_BASE] = 1
  }
  return out
}

/**
 * Convert amount from currency A to B using GHS-normalized rates:
 * rate(A→B) = rates[B] / rates[A], amount_B = amount_A * rate(A→B).
 */
export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: RatesMap,
): { converted: number; rate: number } {
  if (!Number.isFinite(amount)) {
    throw new Error("Amount must be a finite number")
  }
  const from = normCode(fromCurrency)
  const to = normCode(toCurrency)
  if (from === to) {
    return { converted: amount, rate: 1 }
  }
  const rFrom = rates[from]
  const rTo = rates[to]
  if (rFrom === undefined || rTo === undefined) {
    throw new Error(
      `Missing rate for ${rFrom === undefined ? from : to} in snapshot`,
    )
  }
  if (rFrom === 0) {
    throw new Error(`Invalid rate: zero value for ${from}`)
  }
  const rate = rTo / rFrom
  return { converted: amount * rate, rate }
}
