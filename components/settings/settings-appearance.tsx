"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SettingsAppearance() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="glass p-4 sm:p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Theme</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Choose between light and dark mode.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setTheme("light")}
            variant={theme === "light" ? "default" : "outline"}
            className={`flex items-center justify-center gap-2 ${
              theme === "light"
                ? "bg-primary text-primary-foreground"
                : "border-border"
            }`}
          >
            <Sun className="w-4 h-4" />
            Light
          </Button>
          <Button
            onClick={() => setTheme("dark")}
            variant={theme === "dark" ? "default" : "outline"}
            className={`flex items-center justify-center gap-2 ${
              theme === "dark"
                ? "bg-primary text-primary-foreground"
                : "border-border"
            }`}
          >
            <Moon className="w-4 h-4" />
            Dark
          </Button>
        </div>

        {mounted && (
          <div className="rounded-lg bg-muted/70 p-3 text-sm text-foreground/90">
            Current theme: <strong>{theme === "dark" ? "Dark" : "Light"}</strong>
          </div>
        )}
      </div>
    </div>
  )
}
