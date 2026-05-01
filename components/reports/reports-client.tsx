"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SpendByCategoryChart } from "./spend-by-category-chart"; 
import { IncomeVsExpensesChart } from "./income-vs-expenses-chart";
import { DailySpendHeatmap } from "./daily-spend-heatmap";
import { CategoryDonutChart } from "./category-donut-chart";
interface CategorySpendItem {
  categoryId: string;
  categoryName: string;
  color: string | null;
  total: string;
  totalRaw: number;
}

interface TrendItem {
  month: number;
  year: number;
  income: string;
  incomeRaw: number;
  expenses: string;
  expensesRaw: number;
}

interface DailySpendItem {
  date: string;
  total: string;
  totalRaw: number;
}

interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  color: string | null;
  total: string;
  totalRaw: number;
  percentage: number;
}

interface Props {
  categorySpend: CategorySpendItem[];
  trend: TrendItem[];
  dailySpend: DailySpendItem[];
  categoryBreakdown: CategoryBreakdownItem[];
  month: number;
  year: number;
  currency: string;
}

export function ReportsClient({
  categorySpend,
  trend,
  dailySpend,
  categoryBreakdown,
  month,
  year,
  currency,
}: Props) {
  const router = useRouter();

  const handlePreviousMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    router.push(`/reports?month=${newMonth}&year=${newYear}`);
  };

  const handleNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    router.push(`/reports?month=${newMonth}&year=${newYear}`);
  };

  const monthName = new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Reports"
        description="Visual breakdowns of your spending and income trends."
      />

      {/* Month/Year Picker */}
      <div className="flex items-center justify-between rounded-2xl backdrop-blur-lg bg-white/10 dark:bg-[rgba(32,32,32,0.6)] border border-white/15 dark:border-white/8 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          className="cursor-pointer hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="text-lg font-semibold text-center min-w-[180px]">
          {monthName}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="cursor-pointer hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Category */}
        <div className="rounded-2xl backdrop-blur-lg bg-white/10 dark:bg-[rgba(32,32,32,0.6)] border border-white/15 dark:border-white/8 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
          <h3 className="text-lg font-semibold mb-4">Spend by Category</h3>
          {categorySpend.length > 0 ? (
            <SpendByCategoryChart data={categorySpend} currency={currency} />
          ) : (
            <div className="h-64 flex items-center justify-center text-text-muted">
              No expense data for this period
            </div>
          )}
        </div>

        {/* Income vs Expenses */}
        <div className="rounded-2xl backdrop-blur-lg bg-white/10 dark:bg-[rgba(32,32,32,0.6)] border border-white/15 dark:border-white/8 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
          <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
          {trend.length > 0 ? (
            <IncomeVsExpensesChart data={trend} currency={currency} />
          ) : (
            <div className="h-64 flex items-center justify-center text-text-muted">
              No transaction data available
            </div>
          )}
        </div>

        {/* Daily Spend Heatmap */}
        <div className="rounded-2xl backdrop-blur-lg bg-white/10 dark:bg-[rgba(32,32,32,0.6)] border border-white/15 dark:border-white/8 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
          <h3 className="text-lg font-semibold mb-4">Daily Spend Pattern</h3>
          {dailySpend.length > 0 ? (
            <DailySpendHeatmap
              data={dailySpend}
              month={month}
              year={year}
              currency={currency}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-text-muted">
              No spending data for this period
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="rounded-2xl backdrop-blur-lg bg-white/10 dark:bg-[rgba(32,32,32,0.6)] border border-white/15 dark:border-white/8 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
          <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
          {categoryBreakdown.length > 0 ? (
            <CategoryDonutChart data={categoryBreakdown} currency={currency} />
          ) : (
            <div className="h-64 flex items-center justify-center text-text-muted">
              No expense categories this period
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
