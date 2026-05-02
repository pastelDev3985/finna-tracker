import { Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/currency";
import {
  getDashboardSummary,
  getBudgetHealthStrip,
  getTopGoals,
  getRecentTransactions,
} from "@/lib/services/dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { BudgetHealthStrip } from "@/components/dashboard/budget-health-strip";
import { GoalsPreview } from "@/components/dashboard/goals-preview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const currency = session!.user.currency ?? "GHS";

  // Parallel fetch — all 4 data sources at once
  const [summaryResult, budgetsResult, goalsResult, txResult] =
    await Promise.all([
      getDashboardSummary(userId),
      getBudgetHealthStrip(userId),
      getTopGoals(userId),
      getRecentTransactions(userId),
    ]);

  // ─── Serialize Decimal → string before passing to client components ──────────

  const summary = summaryResult.data;
  const balanceProps = summary
    ? {
        totalIncome: formatCurrency(summary.totalIncome, currency),
        totalExpenses: formatCurrency(summary.totalExpenses, currency),
        net: formatCurrency(summary.net, currency),
        netIsPositive: summary.net.greaterThanOrEqualTo(0),
        month: summary.month,
        year: summary.year,
      }
    : null;

  const budgetItems = (budgetsResult.data ?? []).map((b) => ({
    id: b.id,
    categoryName: b.category.name,
    spentAmount: formatCurrency(b.spentAmount, currency),
    limitAmount: formatCurrency(b.limitAmount, currency),
    percentUsed: b.percentUsed,
    isOverBudget: b.isOverBudget,
  }));

  const goalItems = (goalsResult.data ?? []).map((g) => {
    const saved = parseFloat(g.savedAmount.toString());
    const target = parseFloat(g.targetAmount.toString());
    const percentage = target > 0 ? Math.round((saved / target) * 100) : 0;
    return {
      id: g.id,
      name: g.name,
      savedAmount: formatCurrency(g.savedAmount, currency),
      targetAmount: formatCurrency(g.targetAmount, currency),
      percentage,
      status: g.status,
    };
  });

  const txItems = (txResult.data ?? []).map((tx) => ({
    id: tx.id,
    categoryName: tx.category.name,
    note: tx.note,
    date: new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
    }).format(new Date(tx.date)),
    amount: formatCurrency(tx.amount, currency),
    type: tx.type as "INCOME" | "EXPENSE",
  }));

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
      <PageHeader
        title={`Good ${greeting()}, ${session?.user?.name?.split(" ")[0] ?? "there"}`}
        description="Here's your financial snapshot for this month."
      />

      {/* Balance card */}
      {balanceProps ? (
        <BalanceCard {...balanceProps} />
      ) : (
        <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
          Could not load summary data.
        </div>
      )}

      {/* Budget & Goals grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <BudgetHealthStrip budgets={budgetItems} />
        <GoalsPreview goals={goalItems} />
      </div>

      <RecentTransactions transactions={txItems} />

      {/* Mobile FAB — sits above the bottom nav (bottom-[4.5rem] = 16+4 spacing) */}
      <Link
        href="/transactions/new"
        aria-label="Add transaction"
        className="fixed bottom-[4.5rem] right-4 flex size-14 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-2xl active:translate-y-0 active:scale-95 active:bg-primary-active md:hidden"
      >
        <Plus className="size-6" aria-hidden />
      </Link>

      {/* Desktop FAB */}
      <Link
        href="/transactions/new"
        aria-label="Add transaction"
        className="fixed bottom-8 right-8 hidden cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-xl transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-2xl active:translate-y-0 active:scale-[0.97] active:bg-primary-active md:flex"
      >
        <Plus className="size-4" aria-hidden />
        Add transaction
      </Link>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
