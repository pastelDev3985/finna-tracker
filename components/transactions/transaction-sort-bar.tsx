"use client";

import { ArrowDownWideNarrow } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TRANSACTION_SORT_OPTIONS,
  type TransactionSortValue,
  transactionsListHref,
} from "@/lib/transactions-sort";

interface Props {
  currentSort: TransactionSortValue;
}

export function TransactionSortBar({ currentSort }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSortChange(value: string | null) {
    if (!value) return;
    const next = value as TransactionSortValue;
    startTransition(() => {
      router.push(transactionsListHref(1, next));
    });
  }

  return (
    <div className="glass flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <ArrowDownWideNarrow
          className="size-4 shrink-0 text-primary"
          aria-hidden
        />
        <p className="text-sm leading-snug">
          <span className="font-medium text-foreground">Organise</span>
          <span className="hidden sm:inline">
            {" "}
            — choose how this page is ordered. Sorting applies to the current
            page of results.
          </span>
        </p>
      </div>
      <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:min-w-[240px]">
        <Label htmlFor="tx-sort" className="text-xs font-medium">
          Sort by
        </Label>
        <Select
          value={currentSort}
          onValueChange={onSortChange}
          disabled={isPending}
        >
          <SelectTrigger
            id="tx-sort"
            size="sm"
            className="h-9 w-full border-border bg-background/50 sm:w-[min(100%,280px)]"
            aria-label="Sort transactions"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRANSACTION_SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
