"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** Deterministic 0–1 from index (stable SSR + client). */
function t01(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const PARTICLE_COUNT = 120;

export function CosmicBackground({ className }: { className?: string }) {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const left = t01(i, 1) * 100;
        const top = t01(i, 2) * 100;
        const size = 1.25 + t01(i, 3) * 5;
        /** Longer loops = calmer field; still visibly moving (linear, no alternate). */
        const duration = 22 + t01(i, 4) * 48;
        const delay = -(t01(i, 5) * duration);
        /** End position: always drift downward (positive Y), with sideways offset. */
        const dx = (t01(i, 6) - 0.5) * 160;
        const fallPx = Math.round(420 + t01(i, 7) * 920);
        const primaryTint = t01(i, 8) > 0.52;
        const soft = t01(i, 9) > 0.72;
        const oFrom = 0.32 + t01(i, 10) * 0.28;
        const oTo = 0.62 + t01(i, 11) * 0.28;
        const wavy = t01(i, 13) > 0.55;
        const x1 = (t01(i, 14) - 0.5) * 100;
        const x2 = (t01(i, 15) - 0.5) * 140;
        const oMid = 0.48 + t01(i, 16) * 0.32;
        const oMid2 = 0.4 + t01(i, 17) * 0.32;

        return {
          left,
          top,
          size,
          duration,
          delay,
          dx,
          fallPx,
          primaryTint,
          soft,
          oFrom,
          oTo,
          wavy,
          x1,
          x2,
          oMid,
          oMid2,
        };
      }),
    [],
  );

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      {particles.map((p, i) => {
        const animName = p.wavy
          ? "finora-cosmic-drift-wavy"
          : "finora-cosmic-drift";

        const style: Record<string, string | number> = {
          left: `${p.left}%`,
          top: `${p.top}%`,
          width: p.size,
          height: p.size,
          animation: `${animName} ${p.duration}s linear infinite`,
          animationDelay: `${p.delay}s`,
          "--cosmic-x": `${p.dx}px`,
          "--cosmic-y": `${p.fallPx}px`,
          "--cosmic-o-from": String(p.oFrom),
          "--cosmic-o-to": String(p.oTo),
        };

        if (p.wavy) {
          style["--cosmic-x-1"] = `${p.x1}px`;
          style["--cosmic-x-2"] = `${p.x2}px`;
          style["--cosmic-o-mid"] = String(p.oMid);
          style["--cosmic-o-mid2"] = String(p.oMid2);
        }

        return (
          <span
            key={i}
            className={cn(
              "finora-cosmic-particle pointer-events-none absolute rounded-full will-change-[transform,opacity]",
              p.soft && "blur-[0.5px]",
              p.primaryTint
                ? cn(
                    "bg-primary/90",
                    "[box-shadow:0_0_14px_color-mix(in_srgb,var(--primary)_85%,transparent),0_0_32px_color-mix(in_srgb,var(--primary)_45%,transparent),0_0_48px_color-mix(in_srgb,var(--primary)_18%,transparent)]",
                    "dark:bg-primary/55 dark:[box-shadow:0_0_12px_color-mix(in_srgb,var(--primary)_55%,transparent),0_0_28px_color-mix(in_srgb,var(--primary)_22%,transparent)]",
                  )
                : cn(
                    "bg-foreground/52 [box-shadow:0_0_12px_color-mix(in_srgb,var(--primary)_50%,transparent),0_0_26px_color-mix(in_srgb,var(--foreground)_42%,transparent)]",
                    "dark:bg-white/35 dark:[box-shadow:0_0_10px_rgba(255,255,255,0.28),0_0_20px_rgba(255,255,255,0.08)]",
                  ),
            )}
            style={style as CSSProperties}
          />
        );
      })}
    </div>
  );
}
