"use client"

import { Plus, Target } from "lucide-react"
import { useState, useCallback } from "react"
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
import { GoalCard, type GoalCardData } from "@/components/goals/goal-card"
import { GoalForm } from "@/components/goals/goal-form"

interface GoalsClientProps {
  goals: GoalCardData[]
  currencySymbol: string
}

export function GoalsClient({ goals, currencySymbol }: GoalsClientProps) {
  const [showForm, setShowForm] = useState(false)
  const [editGoal, setEditGoal] = useState<GoalCardData | null>(null)
  const router = useRouter()

  const openCreate = useCallback(() => {
    setEditGoal(null)
    setShowForm(true)
  }, [])

  const openEdit = useCallback((g: GoalCardData) => {
    setShowForm(false)
    setEditGoal(g)
  }, [])

  const closeDialog = useCallback(() => {
    setShowForm(false)
    setEditGoal(null)
  }, [])

  const dialogOpen = showForm || !!editGoal

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
      <PageHeader
        title="Savings goals"
        description={`${goals.length} goal${goals.length !== 1 ? "s" : ""} in progress`}
        action={
          <Button
            onClick={openCreate}
            className="cursor-pointer font-semibold"
          >
            <Plus className="size-4" aria-hidden />
            New goal
          </Button>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No savings goals yet"
          description="Create a goal and start tracking your progress toward it."
          action={
            <Button
              onClick={openCreate}
              className="cursor-pointer font-semibold"
            >
              Create your first goal
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onEdit={openEdit} />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editGoal ? "Edit goal" : "New savings goal"}</DialogTitle>
            <DialogDescription>
              {editGoal
                ? "Update the name, target, or deadline. Saved progress is kept."
                : "Set a target amount and optional deadline."}
            </DialogDescription>
          </DialogHeader>
          <GoalForm
            key={editGoal?.id ?? "create"}
            currencySymbol={currencySymbol}
            mode={editGoal ? "edit" : "create"}
            defaultValues={
              editGoal
                ? {
                    id: editGoal.id,
                    name: editGoal.name,
                    targetAmount: editGoal.targetAmountRaw,
                    deadline: editGoal.deadline,
                  }
                : undefined
            }
            onSuccess={() => {
              closeDialog()
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
