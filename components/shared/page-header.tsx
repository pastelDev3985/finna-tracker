import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  /** Accent the page title (e.g. gradient clip). */
  titleClassName?: string;
  /** Optional override for the description line. */
  descriptionClassName?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className,
  titleClassName,
  descriptionClassName,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between gap-3",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h1
          className={cn(
            "font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl",
            titleClassName,
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "mt-0.5 line-clamp-2 text-xs text-muted-foreground sm:mt-1 sm:text-sm",
              descriptionClassName,
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
