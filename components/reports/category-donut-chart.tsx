"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getCurrencySymbol } from "@/lib/currency";

interface DataItem {
  categoryId: string;
  categoryName: string;
  color: string | null;
  total: string;
  totalRaw: number;
  percentage: number;
}

interface Props {
  data: DataItem[];
  currency: string;
}

const COLORS = [
  "var(--color-primary)",
  "var(--color-success)",
  "var(--color-error)",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#f59e0b",
  "#6366f1",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  totalSpend: number;
  currencySymbol: string;
}

const CustomTooltip = ({
  active,
  payload,
  totalSpend,
  currencySymbol,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const percentage =
      totalSpend > 0 ? ((value / totalSpend) * 100).toFixed(1) : "0.0";
    return (
      <div className="bg-secondary/90 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-white">{payload[0].name}</p>
        <p className="text-xs text-text-muted">
          {currencySymbol}
          {value.toFixed(2)}
        </p>
        <p className="text-xs text-text-muted">{percentage}%</p>
      </div>
    );
  }
  return null;
};

export function CategoryDonutChart({ data, currency }: Props) {
  const currencySymbol = getCurrencySymbol(currency);
  const totalSpend = data.reduce((sum, item) => sum + Number(item.totalRaw), 0);
  const [mounted, setMounted] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    setMounted(true);
    setScreenWidth(window.innerWidth);

    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chartData = data.map((item, index) => ({
    name: item.categoryName,
    value: Number(item.totalRaw),
    color: item.color || COLORS[index % COLORS.length],
  }));

  // Responsive dimensions
  const getChartHeight = () => {
    if (screenWidth < 640) return 500;
    if (screenWidth < 768) return 330;
    return 300;
  };

  const getRadii = () => {
    if (screenWidth < 640) return { inner: 35, outer: 55 };
    if (screenWidth < 768) return { inner: 48, outer: 80 };
    return { inner: 60, outer: 100 };
  };

  const getLegendHeight = () => {
    if (screenWidth < 640) return 60;
    if (screenWidth < 768) return 45;
    return 36;
  };

  const getLegendPadding = () => {
    if (screenWidth < 640) return {paddingTop: "90%", paddingBottom: "4px", top:0};
    if (screenWidth < 768) return { paddingTop: "8px", paddingBottom: "2px" };
    return { paddingTop: "20px" };
  };

  const getChartCenter = () => {
    if (screenWidth < 640) return "38%";
    if (screenWidth < 768) return "42%";
    return "50%";
  };

  const getChartMargin = () => {
    if (screenWidth < 640) return { top: 0, right: 0, left: 0, bottom: 0 };
    return { top: 0, right: 0, left: 0, bottom: 0 };
  };

  if (!mounted) return null;

  const radii = getRadii();
  const chartCenter = getChartCenter();
  const chartMargin = getChartMargin();

  return (
    <div
      role="img"
      aria-label="Spending breakdown by category in donut chart format"
    >
      <ResponsiveContainer width="100%" height={getChartHeight()}>
        <PieChart margin={getChartMargin()}>
          <Pie
            data={chartData}
            cx="50%"
            cy={getChartCenter()}
            innerRadius={radii.inner}
            outerRadius={radii.outer}
            paddingAngle={2}
            dataKey="value"
            label={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={
              <CustomTooltip
                totalSpend={totalSpend}
                currencySymbol={currencySymbol}
              />
            }
          />
          <Legend
            verticalAlign="bottom"
            height={getLegendHeight()}
            wrapperStyle={getLegendPadding()}
            formatter={(value, props) => {
              const entry = props.payload as { value: number };
              const percentage =
                totalSpend > 0
                  ? ((entry.value / totalSpend) * 100).toFixed(1)
                  : "0.0";
              return `${value} (${percentage}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
