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
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
      <PageHeader
        title="Reports"
        description="Visual breakdowns of your spending and income trends."
      />

      {/* Month/Year Picker */}
      <div className="glass flex flex-row items-center justify-between p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          className="h-9 w-9 cursor-pointer transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/10"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Button>
        <span className="text-sm font-semibold text-center sm:text-base">
          {monthName}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-9 w-9 cursor-pointer transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/10"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      {/* Charts Grid — single column on mobile, 2-col on lg */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Spend by Category */}
        <div className="glass p-4 sm:p-6">
          <h3 className="mb-4 text-base font-semibold sm:text-lg">Spend by Category</h3>
          {categorySpend.length > 0 ? (
            <SpendByCategoryChart data={categorySpend} currency={currency} />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground sm:h-64">
              No expense data for this period
            </div>
          )}
        </div>

        {/* Income vs Expenses */}
        <div className="glass p-4 sm:p-6">
          <h3 className="mb-4 text-base font-semibold sm:text-lg">Income vs Expenses</h3>
          {trend.length > 0 ? (
            <IncomeVsExpensesChart data={trend} currency={currency} />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground sm:h-64">
              No transaction data available
            </div>
          )}
        </div>

        {/* Daily Spend Heatmap */}
        <div className="glass p-4 sm:p-6">
          <h3 className="mb-4 text-base font-semibold sm:text-lg">Daily Spend Pattern</h3>
          {dailySpend.length > 0 ? (
            <DailySpendHeatmap
              data={dailySpend}
              month={month}
              year={year}
              currency={currency}
            />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground sm:h-64">
              No spending data for this period
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="glass p-4 sm:p-6">
          <h3 className="mb-4 text-base font-semibold sm:text-lg">Category Breakdown</h3>
          {categoryBreakdown.length > 0 ? (
            <CategoryDonutChart data={categoryBreakdown} currency={currency} />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground sm:h-64">
              No expense categories this period
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
