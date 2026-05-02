"use client";

import { useEffect } from "react";

/**
 * Attaches a global mousemove listener that sets --mx / --my CSS custom
 * properties on every .glass/.glass-dark/.glass-light element so the
 * ::before specular radial gradient tracks the pointer in real time —
 * matching the liquid-glass reference implementation.
 */
export function GlassEffect() {
  useEffect(() => {
    function onMove(e: MouseEvent) {
      const els = document.querySelectorAll<HTMLElement>(
        ".glass, .glass-dark, .glass-light",
      );
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%";
        const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%";
        el.style.setProperty("--mx", x);
        el.style.setProperty("--my", y);
      });
    }

    document.addEventListener("mousemove", onMove, { passive: true });
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  return null;
}
