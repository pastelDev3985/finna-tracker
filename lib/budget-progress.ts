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
