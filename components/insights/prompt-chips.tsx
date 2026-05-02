"use client";

import { Button } from "@/components/ui/button";

interface PromptChipsProps {
  onChipClick: (prompt: string) => void;
}

const PRESET_PROMPTS = [
  "Analyse my spending this month",
  "Where am I overspending?",
  "Am I on track with my savings goals?",
  "Predict my expenses for next month",
];

export function PromptChips({ onChipClick }: PromptChipsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 p-6 sm:gap-3 sm:p-4 sm:grid-cols-2 max-w-2xl mx-auto w-full">
      {PRESET_PROMPTS.map((prompt) => (
        <Button
          key={prompt}
          onClick={() => onChipClick(prompt)}
          variant="outline"
          className="h-auto py-4 px-6 sm:py-3 sm:px-8 text-left cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-200 font-medium text-sm whitespace-normal"
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
}
