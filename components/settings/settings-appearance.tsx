"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function SettingsAppearance() {
  const { theme, setTheme } = useTheme()

  return (
    <Card className="backdrop-blur-[16px] bg-white/[0.08] dark:bg-[rgba(32,32,32,0.6)] border border-white/[0.15] p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Theme</h3>
          <p className="text-xs text-muted mb-4">
            Choose between light and dark mode.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setTheme("light")}
            variant={theme === "light" ? "default" : "outline"}
            className={`flex items-center justify-center gap-2 ${
              theme === "light"
                ? "bg-primary text-secondary"
                : "border-white/20"
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
                ? "bg-primary text-secondary"
                : "border-white/20"
            }`}
          >
            <Moon className="w-4 h-4" />
            Dark
          </Button>
        </div>

        <div className="text-xs text-muted p-3 bg-bg-muted rounded-lg">
          Current theme: <strong>{theme === "dark" ? "Dark" : "Light"}</strong>
        </div>
      </div>
    </Card>
  )
}
