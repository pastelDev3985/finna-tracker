import { Sparkles } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="AI Insights"
        description="Chat with your financial data powered by Claude."
      />
      <EmptyState
        icon={Sparkles}
        title="AI chat coming soon"
        description="The streaming AI insights interface is being built."
      />
    </div>
  )
}
