import { BarChart2 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Reports"
        description="Visual breakdowns of your spending and income trends."
      />
      <EmptyState
        icon={BarChart2}
        title="Charts coming soon"
        description="Full Recharts-powered reports are in the next phase."
      />
    </div>
  )
}
