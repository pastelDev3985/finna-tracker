import { auth } from "@/lib/auth";
import { getLatestRatesPayload } from "@/lib/exchange-rates";
import { CurrencyToolsClient } from "@/components/currency-tools/currency-tools-client";
import { PageHeader } from "@/components/shared/page-header";

export default async function CurrencyToolsPage() {
  const session = await auth();
  const currency = session!.user.currency ?? "GHS";
  const initial = await getLatestRatesPayload();

  return (
    <div className="flex flex-col gap-6 p-3 sm:gap-10 sm:p-6 lg:p-8 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <PageHeader
        title="Exchange rates"
        description="Reference FX from cached snapshots (GHS-based provider data). Your account currency is the quick-convert default. Main app balances are not converted automatically."
      />
      <CurrencyToolsClient userCurrency={currency} initialPayload={initial} />
    </div>
  );
}
