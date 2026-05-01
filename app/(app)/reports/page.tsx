import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/currency";
import {
  getMonthlySpendByCategory,
  getIncomeVsExpensesTrend,
  getDailySpend,
  getCategoryBreakdown,
} from "@/lib/services/reports";
import { ReportsClient } from "@/components/reports/reports-client";

interface Props {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function ReportsPage({ searchParams }: Props) {
  const session = await auth();
  const userId = session!.user.id;
  const currency = session!.user.currency ?? "GHS";

  const { month: monthStr, year: yearStr } = await searchParams;
  const now = new Date();
  const month = Math.min(
    12,
    Math.max(1, parseInt(monthStr ?? String(now.getMonth() + 1), 10)),
  );
  const year = parseInt(yearStr ?? String(now.getFullYear()), 10);

  const [
    categorySpendResult,
    trendResult,
    dailySpendResult,
    categoryBreakdownResult,
  ] = await Promise.all([
    getMonthlySpendByCategory(userId, month, year),
    getIncomeVsExpensesTrend(userId, 6),
    getDailySpend(userId, month, year),
    getCategoryBreakdown(userId, month, year),
  ]);

  // Format category spend data
  const categorySpend = (categorySpendResult.data ?? []).map((item) => ({
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    color: item.color,
    total: formatCurrency(item.total, currency),
    totalRaw: item.total,
  }));

  // Format trend data
  const trend = (trendResult.data ?? []).map((item) => ({
    month: item.month,
    year: item.year,
    income: formatCurrency(item.income, currency),
    incomeRaw: item.income,
    expenses: formatCurrency(item.expenses, currency),
    expensesRaw: item.expenses,
  }));

  // Format daily spend data
  const dailySpend = (dailySpendResult.data ?? []).map((item) => ({
    date: item.date,
    total: formatCurrency(item.total, currency),
    totalRaw: item.total,
  }));

  // Format category breakdown data
  const categoryBreakdown = (categoryBreakdownResult.data ?? []).map(
    (item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      color: item.color,
      total: formatCurrency(item.total, currency),
      totalRaw: item.total,
      percentage: item.percentage,
    }),
  );

  return (
    <ReportsClient
      categorySpend={categorySpend}
      trend={trend}
      dailySpend={dailySpend}
      categoryBreakdown={categoryBreakdown}
      month={month}
      year={year}
      currency={currency}
    />
  );
}
