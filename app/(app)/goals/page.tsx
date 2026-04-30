import { auth } from "@/lib/auth"
import { formatCurrency, getCurrencySymbol } from "@/lib/currency"
import { listGoals } from "@/lib/services/goals"
import { GoalsClient } from "@/components/goals/goals-client"

export default async function GoalsPage() {
  const session = await auth()
  const userId = session!.user.id
  const currency = session!.user.currency ?? "GHS"
  const currencySymbol = getCurrencySymbol(currency)

  const result = await listGoals(userId)
  const now = new Date()

  const goals = (result.data ?? []).map((g) => {
    const saved = parseFloat(g.savedAmount.toString())
    const target = parseFloat(g.targetAmount.toString())
    const percentage = target > 0 ? Math.round((saved / target) * 100) : 0
    const daysLeft = g.deadline
      ? Math.ceil((new Date(g.deadline).getTime() - now.getTime()) / 86_400_000)
      : null

    return {
      id: g.id,
      name: g.name,
      savedAmount: formatCurrency(g.savedAmount, currency),
      targetAmount: formatCurrency(g.targetAmount, currency),
      percentage,
      status: g.status as "ACTIVE" | "COMPLETED" | "PAUSED",
      deadline: g.deadline ? new Date(g.deadline).toISOString().slice(0, 10) : null,
      daysLeft,
    }
  })

  return <GoalsClient goals={goals} currencySymbol={currencySymbol} />
}
