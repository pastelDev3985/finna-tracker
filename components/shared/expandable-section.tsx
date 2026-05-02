"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  /** First sections often stay open for faster scanning */
  defaultOpen?: boolean;
  className?: string;
}

export function ExpandableSection({
  title,
  children,
  defaultOpen = false,
  className,
}: ExpandableSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div
      className={cn(
        "glass overflow-hidden rounded-2xl border border-border/80 transition-shadow duration-200 hover:shadow-md",
        className,
      )}
    >
      <button
        type="button"
        id={`${panelId}-trigger`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left transition-[background-color,transform] duration-150 sm:px-5 sm:py-4",
          "hover:bg-muted/40 active:bg-muted/55 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <span className="font-heading text-sm font-semibold text-foreground sm:text-base">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-primary transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={`${panelId}-trigger`}
        hidden={!open}
      >
        <div className="space-y-3 border-t border-border/60 px-4 py-4 text-sm leading-relaxed text-foreground/90 sm:px-5">
          {children}
        </div>
      </div>
    </div>
  );
}
