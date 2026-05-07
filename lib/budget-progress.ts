/**
 * Progress indicator length: share of monthly limit still available.
 * 100 = nothing spent yet; 0 = fully used or over budget.
 */
export function budgetProgressRemainingValue(
  percentUsed: number,
  isOverBudget: boolean,
): number {
  if (isOverBudget) return 0
  return Math.max(0, Math.min(100, 100 - percentUsed))
}

/**
 * Budget spend bar colors (percent of limit used):
 * - Green: up to 70%
 * - Yellow: 71–90%
 * - Red: over 90%, or any over-budget state
 */
export function budgetProgressIndicatorClass(
  percentUsed: number,
  isOverBudget: boolean,
): string {
  if (isOverBudget || percentUsed > 90) {
    return "[&_[data-slot=progress-indicator]]:bg-[var(--color-error)]";
  }
  if (percentUsed > 70) {
    return "[&_[data-slot=progress-indicator]]:bg-[var(--color-warning)]";
  }
  return "[&_[data-slot=progress-indicator]]:bg-[var(--color-success)]";
}
