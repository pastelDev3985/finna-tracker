import { PageHeader } from "@/components/shared/page-header";
import { InsightsChat } from "@/components/insights/insights-chat";

export default function InsightsPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="AI Insights"
        description="Chat with your financial data powered by Gemini."
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <InsightsChat />
      </div>
    </div>
  );
}
