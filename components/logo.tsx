import { cn } from "@/lib/utils";

interface LogoProps {
  /** Hide the wordmark on very narrow screens to free header space */
  hideWordmarkBelow?: "never" | "xs";
}

export function Logo({ hideWordmarkBelow = "never" }: LogoProps) {
  return (
    <div
      className="flex min-w-0 items-center gap-2 sm:gap-2.5"
      aria-label="Finora"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/10 font-heading text-base font-bold text-primary shadow-sm sm:size-9 sm:text-lg">
        F
      </div>
      <p
        className={cn(
          "truncate font-heading text-base font-semibold tracking-tight text-foreground",
          hideWordmarkBelow === "xs" && "hidden min-[400px]:block",
        )}
      >
        Finora
      </p>
    </div>
  );
}
