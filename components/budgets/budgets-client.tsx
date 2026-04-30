"use client"

import { ChevronLeft, ChevronRight, Plus, Wallet } from "lucide-react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { BudgetCard, type BudgetCardData } from "@/components/budgets/budget-card"
import { BudgetForm } from "@/components/budgets/budget-form"

interface Category {
  id: string
  name: string
}

interface BudgetsClientProps {
  budgets: BudgetCardData[]
  expenseCategories: Category[]
  currencySymbol: string
  month: number
  year: number
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

export function BudgetsClient({
  budgets: initialBudgets,
  expenseCategories,
  currencySymbol,
  month,
  year,
}: BudgetsClientProps) {
  const [showForm, setShowForm] = useState(false)
  const [editBudget, setEditBudget] = useState<BudgetCardData | null>(null)
  const [isPending] = useTransition()
  const router = useRouter()

  function navigate(delta: number) {
    let m = month + delta
    let y = year
    if (m < 1) { m = 12; y -= 1 }
    if (m > 12) { m = 1; y += 1 }
    router.push(`/budgets?month=${m}&year=${y}`)
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Budgets"
          description="Set and track your monthly spending limits."
        />
        <div className="flex items-center gap-3">
          {/* Month picker */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-2 py-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isPending}
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <span className="min-w-[90px] text-center text-sm font-semibold text-foreground">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <button
              type="button"
              onClick={() => navigate(1)}
              disabled={isPending}
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
              aria-label="Next month"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>

          <Button
            onClick={() => { setEditBudget(null); setShowForm(true) }}
            className="cursor-pointer font-semibold"
          >
            <Plus className="size-4" aria-hidden />
            Set budget
          </Button>
        </div>
      </div>

      {initialBudgets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No budgets set"
          description="Add a budget limit for a spending category to start tracking."
          action={
            <Button
              onClick={() => setShowForm(true)}
              className="cursor-pointer font-semibold"
            >
              Set your first budget
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {initialBudgets.map((b) => (
            <BudgetCard key={b.id} budget={b} onEdit={setEditBudget} />
          ))}
        </div>
      )}

      {/* Create / edit dialog */}
      <Dialog
        open={showForm || !!editBudget}
        onOpenChange={(open) => {
          if (!open) { setShowForm(false); setEditBudget(null) }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editBudget ? "Edit budget" : "Set budget"}</DialogTitle>
            <DialogDescription>
              {editBudget
                ? `Update the monthly limit for ${editBudget.categoryName}.`
                : "Choose an expense category and set a monthly limit."}
            </DialogDescription>
          </DialogHeader>
          <BudgetForm
            categories={expenseCategories}
            currencySymbol={currencySymbol}
            month={month}
            year={year}
            defaultValues={
              editBudget
                ? { categoryId: editBudget.id, limitAmount: editBudget.limitAmount }
                : undefined
            }
            onSuccess={() => {
              setShowForm(false)
              setEditBudget(null)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
