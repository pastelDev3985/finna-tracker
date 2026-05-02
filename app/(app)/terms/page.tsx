import { TermsPageContent } from "@/components/terms/terms-page-content";
import { PageHeader } from "@/components/shared/page-header";

export default function TermsPage() {
  return (
    <div className="flex flex-col gap-8 p-4 sm:gap-10 sm:p-6 lg:p-8">
      <PageHeader
        title="Terms of service"
        description="Please read these terms before using Finora."
      />

      <TermsPageContent />
    </div>
  );
}
