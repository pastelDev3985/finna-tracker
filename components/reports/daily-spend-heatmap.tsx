"use client"

import { useState } from "react"
import { getCurrencySymbol } from "@/lib/currency"
import type { Decimal } from "@/lib/generated/prisma/internal/prismaNamespace"

interface DataItem {
  date: string
  total: string
  totalRaw: Decimal
}

interface Props {
  data: DataItem[]
  month: number
  year: number
  currency: string
}

export function DailySpendHeatmap({ data, month, year, currency }: Props) {
  const currencySymbol = getCurrencySymbol(currency)
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)

  // Create a map for quick lookup
  const dataMap = new Map(data.map((item) => [item.date, item]))

  // Get max spend to calculate intensity
  const maxSpend = Math.max(...data.map((item) => Number(item.totalRaw)), 1)

  // Generate calendar grid
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const weeks: (number | null)[][] = []
  let currentWeek: (number | null)[] = new Array(startingDayOfWeek).fill(null)

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null)
    }
    weeks.push(currentWeek)
  }

  const getColorIntensity = (spend: number): string => {
    const intensity = spend / maxSpend
    if (intensity === 0) return "var(--bg-muted)"
    if (intensity < 0.25) return "var(--color-yellow-2)"
    if (intensity < 0.5) return "var(--color-yellow-3)"
    if (intensity < 0.75) return "var(--color-yellow-5)"
    return "var(--color-primary)"
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="flex flex-col gap-4">
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-text-secondary p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex flex-col gap-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {week.map((day, dayIndex) => {
              const dateStr = day
                ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                : null
              const dayData = dateStr ? dataMap.get(dateStr) : null
              const spend = dayData ? Number(dayData.totalRaw) : 0
              const bgColor = dayData ? getColorIntensity(spend) : "var(--bg-muted)"

              return (
                <div key={dayIndex}>
                  {day ? (
                    <div
                      className="aspect-square flex items-center justify-center rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary"
                      style={{ backgroundColor: bgColor }}
                      onMouseEnter={() => setHoveredDay(dateStr)}
                      onMouseLeave={() => setHoveredDay(null)}
                      title={
                        dayData
                          ? `${day} ${month}/${year}: ${currencySymbol}${spend.toFixed(2)}`
                          : `${day} ${month}/${year}`
                      }
                    >
                      {day}
                      {hoveredDay === dateStr && dayData && (
                        <div className="absolute mt-10 bg-secondary/90 backdrop-blur-md border border-white/20 rounded-lg p-2 text-white text-xs whitespace-nowrap">
                          {currencySymbol}
                          {spend.toFixed(2)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-square" />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs mt-4">
        <span className="text-text-secondary">Intensity:</span>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "var(--bg-muted)" }} />
          <span className="text-text-secondary">None</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "var(--color-yellow-2)" }} />
          <span className="text-text-secondary">Low</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "var(--color-yellow-3)" }} />
          <span className="text-text-secondary">Medium</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "var(--color-yellow-5)" }} />
          <span className="text-text-secondary">High</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "var(--color-primary)" }} />
          <span className="text-text-secondary">Very High</span>
        </div>
      </div>
    </div>
  )
}
