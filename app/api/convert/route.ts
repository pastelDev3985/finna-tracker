import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { convertAmount, parseRatesJson } from "@/lib/exchange-rates"
import { prisma } from "@/lib/db"

const QuerySchema = z.object({
  from: z.string().min(3).max(5),
  to: z.string().min(3).max(5),
  amount: z.coerce.number().finite(),
})

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const parsed = QuerySchema.safeParse({
    from: url.searchParams.get("from") ?? "",
    to: url.searchParams.get("to") ?? "",
    amount: url.searchParams.get("amount") ?? "1",
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query: from, to (ISO codes), amount required" },
      { status: 400 },
    )
  }

  const { from, to, amount } = parsed.data

  const row = await prisma.exchangeRateSnapshot.findFirst({
    orderBy: { fetchedAt: "desc" },
  })

  if (!row) {
    return NextResponse.json(
      { error: "no_snapshot", message: "No cached rates available" },
      { status: 404 },
    )
  }

  const rates = parseRatesJson(row.ratesJson)

  try {
    const { converted, rate } = convertAmount(amount, from, to, rates)
    return NextResponse.json({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount,
      converted,
      rate,
      fetchedAt: row.fetchedAt.toISOString(),
      baseCurrency: row.baseCurrency,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Conversion failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
