import type { UserProfileStats } from "@/lib/services/user-stats"
import { cn } from "@/lib/utils"

function StatTile({
  label,
  value,
  hint,
  className,
}: {
  label: string
  value: string | number
  hint?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-muted/20 px-3 py-3 ring-1 ring-border/50 sm:px-4 sm:py-3.5",
        className,
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
        {label}
      </p>
      <p className="mt-1 font-heading text-lg font-bold tabular-nums text-primary sm:text-xl">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

interface SettingsProfileStatsProps {
  stats: UserProfileStats
}

export function SettingsProfileStats({ stats }: SettingsProfileStatsProps) {
  const memberLabel = new Date(stats.memberSince).toLocaleDateString(
    undefined,
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  )

  return (
    <div
      className="glass rounded-2xl border border-border/80 border-l-4 border-l-primary/50 p-4 shadow-sm sm:p-6"
      aria-labelledby="profile-stats-heading"
    >
      <h3
        id="profile-stats-heading"
        className="font-heading text-base font-semibold text-primary sm:text-lg"
      >
        Your stats
      </h3>
      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
        A quick snapshot of your Finora activity. Counts are for your account
        only.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatTile label="Member since" value={memberLabel} />
        <StatTile
          label="Transactions"
          value={stats.transactionCount}
          hint="All time"
        />
        <StatTile
          label="Categories"
          value={stats.categoryCount}
          hint={`${stats.incomeCategoriesCount} income · ${stats.expenseCategoriesCount} expense`}
        />
        <StatTile
          label="Savings goals"
          value={stats.goalCount}
          hint={
            stats.activeGoalsCount > 0
              ? `${stats.activeGoalsCount} active`
              : undefined
          }
        />
        <StatTile
          label="Goal contributions"
          value={stats.goalContributionCount}
          hint="Logged deposits"
        />
        <StatTile
          label="Budgets this month"
          value={stats.budgetsThisMonthCount}
          hint={new Date().toLocaleString(undefined, { month: "long", year: "numeric" })}
        />
      </div>
    </div>
  )
}
