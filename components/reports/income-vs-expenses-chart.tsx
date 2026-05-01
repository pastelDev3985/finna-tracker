"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { getCurrencySymbol } from "@/lib/currency"
import type { Decimal } from "@/lib/generated/prisma/internal/prismaNamespace"

interface DataItem {
  month: number
  year: number
  income: string
  incomeRaw: Decimal
  expenses: string
  expensesRaw: Decimal
}

interface Props {
  data: DataItem[]
  currency: string
}

export function IncomeVsExpensesChart({ data, currency }: Props) {
  const currencySymbol = getCurrencySymbol(currency)

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const chartData = data.map((item) => ({
    name: monthNames[item.month - 1],
    income: Number(item.incomeRaw),
    expenses: Number(item.expensesRaw),
  }))

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: Array<{ value: number; name: string; color: string }>
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-secondary/90 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-lg">
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {currencySymbol}
              {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
        <XAxis stroke="var(--text-secondary)" />
        <YAxis stroke="var(--text-secondary)" />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
        <Line
          type="monotone"
          dataKey="income"
          stroke="var(--color-success)"
          strokeWidth={2}
          dot={{ fill: "var(--color-success)", r: 4 }}
          activeDot={{ r: 6 }}
          name="Income"
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="var(--color-error)"
          strokeWidth={2}
          dot={{ fill: "var(--color-error)", r: 4 }}
          activeDot={{ r: 6 }}
          name="Expenses"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
