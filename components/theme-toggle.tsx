"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface ThemeToggleProps {
  /** Tighter control for marketing / mobile nav bars */
  compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useIsClient();

  const size = compact ? "icon-sm" : "icon-lg";

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size={size}
        className="shrink-0 cursor-pointer transition-all duration-200"
        aria-label="Toggle theme"
        disabled
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className="shrink-0 cursor-pointer transition-all duration-200"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </Button>
  );
}
