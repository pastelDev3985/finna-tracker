import { PageHeader } from "@/components/shared/page-header";
import { InsightsChat } from "@/components/insights/insights-chat";

export default function InsightsPage() {
  return (
    /*
     * Mobile: 100dvh minus bottom-nav (4rem) minus a little breathing room
     * Desktop md+: no bottom nav, minus any top chrome
     */
    <div className="flex h-[calc(100dvh-5rem)] flex-col gap-3 p-3 sm:gap-6 sm:p-6 md:h-[calc(100vh-2rem)] lg:p-8">
      <PageHeader
        title="AI Insights"
        description="Ask about your spending, budgets, and goals using your Finora data."
      />
      <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
        This assistant only answers{" "}
        <span className="font-medium text-foreground/90">
          personal finance questions
        </span>{" "}
        tied to your account. It is not a general chatbot; unrelated topics
        will be declined. Answers are for information only and are not
        financial, tax, or legal advice.
      </p>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <InsightsChat />
      </div>
    </div>
  );
}
