"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getCurrencySymbol } from "@/lib/currency";
interface DataItem {
  categoryId: string;
  categoryName: string;
  color: string | null;
  total: string;
  totalRaw: number;
}

interface Props {
  data: DataItem[];
  currency: string;
}

const DEFAULT_COLOR = "var(--color-primary)";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  currencySymbol: string;
}

const CustomTooltip = ({
  active,
  payload,
  currencySymbol,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const amount = payload[0].value;
    return (
      <div className="bg-secondary/90 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-white">
          {currencySymbol}
          {amount.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export function SpendByCategoryChart({ data, currency }: Props) {
  const currencySymbol = getCurrencySymbol(currency);
  const [mounted, setMounted] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    setMounted(true);
    setScreenWidth(window.innerWidth);

    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: Number(item.totalRaw),
    color: item.color || DEFAULT_COLOR,
  }));

  // Responsive margins: reduce left margin on smaller screens
  const getMargin = () => {
    if (screenWidth < 640) return { top: 5, right: 15, left: 60, bottom: 5 };
    if (screenWidth < 768) return { top: 5, right: 20, left: 100, bottom: 5 };
    return { top: 5, right: 30, left: 200, bottom: 5 };
  };

  const getYAxisWidth = () => {
    if (screenWidth < 640) return 55;
    if (screenWidth < 768) return 95;
    return 190;
  };

  const getChartHeight = () => {
    if (screenWidth < 640) return 250 + chartData.length * 20;
    return 300 + Math.max(0, (chartData.length - 5) * 15);
  };

  if (!mounted) return null;

  return (
    <div role="img" aria-label="Spending by category horizontal bar chart">
      <ResponsiveContainer width="100%" height={getChartHeight()}>
        <BarChart data={chartData} layout="vertical" margin={getMargin()}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
          <XAxis
            type="number"
            stroke="var(--text-secondary)"
            tick={{ fontSize: screenWidth < 640 ? 11 : 12 }}
          />
          <YAxis
            dataKey="name"
            type="category"
            stroke="var(--text-secondary)"
            width={getYAxisWidth()}
            tick={{ fontSize: screenWidth < 640 ? 11 : 12 }}
          />
          <Tooltip
            content={<CustomTooltip currencySymbol={currencySymbol} />}
          />
          <Bar
            dataKey="value"
            fill="var(--color-primary)"
            fillOpacity={0.8}
            radius={4}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || "var(--color-primary)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
