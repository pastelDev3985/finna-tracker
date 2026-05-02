import { GuidePageContent } from "@/components/guide/guide-page-content";
import { PageHeader } from "@/components/shared/page-header";

export default function UserGuidePage() {
  return (
    <div className="flex flex-col gap-8 p-4 sm:gap-10 sm:p-6 lg:p-8">
      <PageHeader
        title="User guide"
        description="How to get the most out of Finora — tracking, budgets, goals, and insights."
      />

      <GuidePageContent />
    </div>
  );
}
