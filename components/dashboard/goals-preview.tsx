import { ArrowRight, Target } from "lucide-react"
import Link from "next/link"

interface GoalPreviewItem {
  id: string
  name: string
  savedAmount: string
  targetAmount: string
  percentage: number
  status: string
}

interface GoalsPreviewProps {
  goals: GoalPreviewItem[]
}

const RING_SIZE = 48
const STROKE = 4
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
      aria-hidden
      className="shrink-0"
    >
      {/* Track */}
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={R}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        className="text-border"
      />
      {/* Fill */}
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
      {/* Label */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-foreground font-heading font-bold"
        fontSize="10"
      >
        {pct}%
      </text>
    </svg>
  )
}

export function GoalsPreview({ goals }: GoalsPreviewProps) {
  if (goals.length === 0) {
    return (
      <div className="glass rounded-2xl p-4 sm:p-6">
        <SectionHeader />
        <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-8 text-center">
          <Target className="size-8 text-muted-foreground" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">No active goals</p>
            <p className="text-xs text-muted-foreground">
              Create a savings goal to track your progress.
            </p>
          </div>
          <Link
            href="/goals"
            className="text-xs font-medium text-primary hover:text-primary-hover transition-colors duration-200 cursor-pointer"
          >
            Create your first goal →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      <SectionHeader />
      <div className="mt-4 space-y-3">
        {goals.map((goal) => (
          <Link
            key={goal.id}
            href="/goals"
            className="group flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-muted/30 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted"
          >
            <CircleRing percentage={goal.percentage} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {goal.name}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {goal.savedAmount} of {goal.targetAmount}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <Link
        href="/goals"
        className="mt-4 flex cursor-pointer items-center gap-1 text-xs font-medium text-primary transition-colors duration-200 hover:text-primary-hover"
      >
        View all goals
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  )
}

function SectionHeader() {
  return (
    <h2 className="font-heading text-base font-semibold text-foreground">
      Savings goals
    </h2>
  )
}

export function GoalsPreviewSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 animate-pulse">
      <div className="h-5 w-28 rounded-md bg-muted mb-4" />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border p-3">
            <div className="size-12 shrink-0 rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-32 rounded-md bg-muted" />
              <div className="h-3 w-24 rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
