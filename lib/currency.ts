import type { Decimal } from "@/lib/generated/prisma/internal/prismaNamespace"

export interface SupportedCurrency {
  code: string
  name: string
  symbol: string
}

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  { code: "GHS", name: "Ghanaian Cedi",       symbol: "₵"  },
  { code: "USD", name: "US Dollar",            symbol: "$"  },
  { code: "EUR", name: "Euro",                 symbol: "€"  },
  { code: "GBP", name: "British Pound",        symbol: "£"  },
  { code: "NGN", name: "Nigerian Naira",       symbol: "₦"  },
  { code: "KES", name: "Kenyan Shilling",      symbol: "KSh"},
  { code: "ZAR", name: "South African Rand",   symbol: "R"  },
  { code: "EGP", name: "Egyptian Pound",       symbol: "E£" },
  { code: "TZS", name: "Tanzanian Shilling",   symbol: "TSh"},
  { code: "UGX", name: "Ugandan Shilling",     symbol: "USh"},
  { code: "ETB", name: "Ethiopian Birr",       symbol: "Br" },
  { code: "XOF", name: "West African CFA",     symbol: "CFA"},
  { code: "MAD", name: "Moroccan Dirham",      symbol: "MAD"},
  { code: "CAD", name: "Canadian Dollar",      symbol: "CA$"},
  { code: "AUD", name: "Australian Dollar",    symbol: "A$" },
  { code: "JPY", name: "Japanese Yen",         symbol: "¥"  },
  { code: "CNY", name: "Chinese Yuan",         symbol: "¥"  },
  { code: "INR", name: "Indian Rupee",         symbol: "₹"  },
  { code: "CHF", name: "Swiss Franc",          symbol: "Fr" },
  { code: "SEK", name: "Swedish Krona",        symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone",      symbol: "kr" },
  { code: "DKK", name: "Danish Krone",         symbol: "kr" },
  { code: "SGD", name: "Singapore Dollar",     symbol: "S$" },
  { code: "AED", name: "UAE Dirham",           symbol: "AED"},
  { code: "SAR", name: "Saudi Riyal",          symbol: "SR" },
  { code: "BRL", name: "Brazilian Real",       symbol: "R$" },
  { code: "MXN", name: "Mexican Peso",         symbol: "MX$"},
  { code: "RUB", name: "Russian Ruble",        symbol: "₽"  },
  { code: "TRY", name: "Turkish Lira",         symbol: "₺"  },
  { code: "HKD", name: "Hong Kong Dollar",     symbol: "HK$"},
]

/**
 * Format a monetary amount using Intl.NumberFormat.
 * Works with Prisma Decimal, JS number, or string representations.
 * Currency is a display-only preference — no conversion is performed.
 */
export function formatCurrency(
  amount: Decimal | number | string,
  currency: string = "GHS"
): string {
  const numericValue =
    typeof amount === "number"
      ? amount
      : parseFloat(amount.toString())

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue)
  } catch {
    // Fallback: find the symbol manually and format
    const found = SUPPORTED_CURRENCIES.find((c) => c.code === currency)
    const symbol = found?.symbol ?? currency
    return `${symbol}${numericValue.toFixed(2)}`
  }
}

/**
 * Returns the symbol for a given ISO 4217 currency code.
 */
export function getCurrencySymbol(currency: string): string {
  return SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency
}
