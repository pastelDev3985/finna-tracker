"use client"

import { Trash2 } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { deleteGoalAction } from "@/lib/actions/goals"

const RING_SIZE = 72
const STROKE = 5
const R = (RING_SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * R

function CircleRing({ percentage }: { percentage: number }) {
  const pct = Math.min(Math.max(percentage, 0), 100)
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE

  return (
    <svg
      width={RING_SIZE}
      height={RING_SIZE}
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      aria-label={`${pct}% complete`}
      className="shrink-0"
    >
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={R}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        className="text-border"
      />
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={R}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-primary transition-all duration-500"
        transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-foreground font-heading font-bold"
        fontSize="12"
      >
        {pct}%
      </text>
    </svg>
  )
}

export interface GoalCardData {
  id: string
  name: string
  savedAmount: string
  targetAmount: string
  percentage: number
  status: "ACTIVE" | "COMPLETED" | "PAUSED"
  deadline: string | null
  daysLeft: number | null
}

interface GoalCardProps {
  goal: GoalCardData
}

const STATUS_BADGE = {
  ACTIVE:    { label: "Active",    className: "bg-primary/10 text-primary border-primary/20" },
  COMPLETED: { label: "Completed", className: "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20" },
  PAUSED:    { label: "Paused",    className: "bg-muted text-muted-foreground border-border" },
}

export function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteGoalAction(goal.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Goal deleted.")
        setShowDeleteDialog(false)
        router.refresh()
      }
    })
  }

  const badge = STATUS_BADGE[goal.status]

  return (
    <>
    <div
      className="glass group relative flex flex-col gap-4 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Status + delete */}
      <div className="flex items-center justify-between gap-2">
        <Badge className={cn("text-[10px] font-medium border", badge.className)}>
          {badge.label}
        </Badge>
        <button
          type="button"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isPending}
          className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground/50 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive md:invisible md:group-hover:visible"
          aria-label={`Delete ${goal.name}`}
        >
          <Trash2 className="size-3.5" aria-hidden />
        </button>
      </div>

      {/* Ring + info */}
      <div className="flex items-center gap-4">
        <CircleRing percentage={goal.percentage} />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-base font-semibold text-foreground leading-tight">
            {goal.name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">
            {goal.savedAmount} of {goal.targetAmount}
          </p>
          {goal.daysLeft !== null && (
            <p
              className={cn(
                "mt-1 text-xs font-medium tabular-nums",
                goal.daysLeft < 0
                  ? "text-[var(--color-error)]"
                  : goal.daysLeft <= 7
                    ? "text-[var(--color-warning)]"
                    : "text-muted-foreground"
              )}
            >
              {goal.daysLeft < 0
                ? `${Math.abs(goal.daysLeft)}d overdue`
                : goal.daysLeft === 0
                  ? "Due today"
                  : `${goal.daysLeft}d left`}
            </p>
          )}
        </div>
      </div>
    </div>

    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete goal?</DialogTitle>
          <DialogDescription>
            This will permanently delete{" "}
            <span className="font-medium text-foreground">{goal.name}</span>{" "}
            and all its contributions. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
