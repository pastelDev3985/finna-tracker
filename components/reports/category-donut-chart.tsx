"use client"

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import { getCurrencySymbol } from "@/lib/currency"

interface DataItem {
  categoryId: string
  categoryName: string
  color: string | null
  total: string
  totalRaw: number
  percentage: number
}

interface Props {
  data: DataItem[]
  currency: string
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
]

export function CategoryDonutChart({ data, currency }: Props) {
  const currencySymbol = getCurrencySymbol(currency)
  const totalSpend = data.reduce((sum, item) => sum + Number(item.totalRaw), 0)

  const chartData = data.map((item, index) => ({
    name: item.categoryName,
    value: Number(item.totalRaw),
    color: item.color || COLORS[index % COLORS.length],
  }))

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: Array<{ value: number; name: string }>
  }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      const percentage = totalSpend > 0 ? ((value / totalSpend) * 100).toFixed(1) : "0.0"
      return (
        <div className="bg-secondary/90 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-white">{payload[0].name}</p>
          <p className="text-xs text-text-muted">{currencySymbol}{value.toFixed(2)}</p>
          <p className="text-xs text-text-muted">{percentage}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ paddingTop: "20px" }}
          formatter={(value, props) => {
            const entry = props.payload as { value: number }
            const percentage = totalSpend > 0 ? ((entry.value / totalSpend) * 100).toFixed(1) : "0.0"
            return `${value} (${percentage}%)`
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
