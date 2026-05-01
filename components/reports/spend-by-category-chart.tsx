"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { getCurrencySymbol } from "@/lib/currency"
import type { Decimal } from "@/lib/generated/prisma/internal/prismaNamespace"

interface DataItem {
  categoryId: string
  categoryName: string
  color: string | null
  total: string
  totalRaw: Decimal
}

interface Props {
  data: DataItem[]
  currency: string
}

const DEFAULT_COLOR = "var(--color-primary)"

export function SpendByCategoryChart({ data, currency }: Props) {
  const currencySymbol = getCurrencySymbol(currency)

  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: Number(item.totalRaw),
    color: item.color || DEFAULT_COLOR,
  }))

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: Array<{ value: number }>
  }) => {
    if (active && payload && payload.length) {
      const amount = payload[0].value
      return (
        <div className="bg-secondary/90 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-white">
            {currencySymbol}
            {amount.toFixed(2)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
        <XAxis type="number" stroke="var(--text-secondary)" />
        <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" width={190} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" fill="var(--color-primary)" fillOpacity={0.8} radius={4}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || "var(--color-primary)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
