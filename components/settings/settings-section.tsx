import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  id: string;
  title: string;
  description: string;
  /** Primary accent bar by default; destructive styling for danger zone. */
  accent?: "default" | "danger";
  children: ReactNode;
}

export function SettingsSection({
  id,
  title,
  description,
  children,
  accent = "default",
}: SettingsSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-6 space-y-4 sm:scroll-mt-8"
    >
      <header className="flex gap-3 sm:gap-4">
        <div
          className={cn(
            "mt-1 w-1 shrink-0 self-stretch rounded-full",
            accent === "danger"
              ? "bg-destructive/85 shadow-[0_0_10px_-2px] shadow-destructive/40"
              : "bg-primary/85 shadow-[0_0_12px_-2px] shadow-primary/35",
          )}
          aria-hidden
        />
        <div className="min-w-0 space-y-1">
          <h2
            id={headingId}
            className={cn(
              "font-heading text-lg font-bold tracking-tight sm:text-xl",
              accent === "danger" ? "text-destructive" : "text-foreground",
            )}
          >
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </header>
      {children}
    </section>
  );
}
