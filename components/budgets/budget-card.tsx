import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface BudgetCardData {
  id: string
  categoryId: string
  categoryName: string
  spentAmount: string
  limitAmount: string
  limitAmountRaw: string
  percentUsed: number
  isOverBudget: boolean
}

interface BudgetCardProps {
  budget: BudgetCardData
  onEdit?: (budget: BudgetCardData) => void
}

export function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  const progressColor = budget.isOverBudget
    ? "[&>div]:bg-[var(--color-error)]"
    : budget.percentUsed >= 75
      ? "[&>div]:bg-[var(--color-warning)]"
      : "[&>div]:bg-[var(--color-success)]"

  return (
    <button
      type="button"
      onClick={() => onEdit?.(budget)}
      className="glass group w-full cursor-pointer rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-primary"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="font-heading text-base font-semibold text-foreground">
          {budget.categoryName}
        </p>
        {budget.isOverBudget && (
          <Badge className="shrink-0 bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20 text-[10px]">
            Over budget
          </Badge>
        )}
      </div>

      <Progress
        value={Math.min(budget.percentUsed, 100)}
        className={cn("h-2 rounded-full mb-3", progressColor)}
      />

      <div className="flex items-center justify-between gap-2 text-sm">
        <div>
          <span className="font-semibold tabular-nums text-foreground">
            {budget.spentAmount}
          </span>
          <span className="text-muted-foreground"> spent</span>
        </div>
        <div className="text-muted-foreground tabular-nums">
          of {budget.limitAmount} ({Math.round(budget.percentUsed)}%)
        </div>
      </div>
    </button>
  )
}
