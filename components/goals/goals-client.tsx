"use client"

import { Plus, Target } from "lucide-react"
import { useState } from "react"
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
  const router = useRouter()

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Savings goals"
        description={`${goals.length} goal${goals.length !== 1 ? "s" : ""} in progress`}
        action={
          <Button
            onClick={() => setShowForm(true)}
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
              onClick={() => setShowForm(true)}
              className="cursor-pointer font-semibold"
            >
              Create your first goal
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New savings goal</DialogTitle>
            <DialogDescription>
              Set a target amount and optional deadline.
            </DialogDescription>
          </DialogHeader>
          <GoalForm
            currencySymbol={currencySymbol}
            mode="create"
            onSuccess={() => {
              setShowForm(false)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
