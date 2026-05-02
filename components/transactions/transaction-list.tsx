"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { deleteTransactionAction } from "@/lib/actions/transactions";
import { TransactionForm } from "./transaction-form";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TxRow {
  id: string;
  categoryId: string;
  categoryName: string;
  type: "INCOME" | "EXPENSE";
  amount: string;
  rawAmount: string;
  date: string;
  rawDate: string;
  note: string | null;
  recurrence: string;
}

interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
}

interface TransactionListProps {
  transactions: TxRow[];
  categories: Category[];
  currencySymbol: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function TransactionList({
  transactions,
  categories,
  currencySymbol,
}: TransactionListProps) {
  const [editTx, setEditTx] = useState<TxRow | null>(null);
  const [deleteTx, setDeleteTx] = useState<TxRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleteTx) return;
    startTransition(async () => {
      const result = await deleteTransactionAction(deleteTx.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Transaction deleted.");
        setDeleteTx(null);
      }
    });
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">
          No transactions found
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add your first transaction to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-2xl border border-border">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[110px]">Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="hidden sm:table-cell">Note</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[72px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow
                key={tx.id}
                className="group cursor-pointer transition-colors duration-150 hover:bg-muted/30"
                onClick={() => setEditTx(tx)}
              >
                <TableCell className="text-xs text-muted-foreground">
                  {tx.date}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-medium border",
                        tx.type === "INCOME"
                          ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)]"
                          : "border-[var(--color-error)]/30 bg-[var(--color-error)]/10 text-[var(--color-error)]",
                      )}
                    >
                      {tx.type === "INCOME" ? "IN" : "OUT"}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      {tx.categoryName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden max-w-[200px] sm:table-cell">
                  {tx.note ? (
                    <span className="truncate text-xs text-muted-foreground">
                      {tx.note}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      "font-semibold tabular-nums text-sm",
                      tx.type === "INCOME"
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-error)]",
                    )}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}
                    {tx.amount}
                  </span>
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTx(tx);
                    }}
                    className="invisible flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive group-hover:visible"
                    aria-label={`Delete ${tx.categoryName} transaction`}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit sheet */}
      <Sheet open={!!editTx} onOpenChange={(open) => !open && setEditTx(null)}>
        <SheetContent side="right" className="w-full max-w-sm overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Edit transaction</SheetTitle>
            <SheetDescription>
              Update the details of this transaction.
            </SheetDescription>
          </SheetHeader>
          {editTx && (
            <TransactionForm
              categories={categories}
              currencySymbol={currencySymbol}
              mode="edit"
              defaultValues={{
                id: editTx.id,
                categoryId: editTx.categoryId,
                type: editTx.type,
                amount: editTx.rawAmount,
                date: editTx.rawDate,
                note: editTx.note,
                recurrence: editTx.recurrence,
              }}
              onSuccess={() => setEditTx(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirm dialog */}
      <Dialog
        open={!!deleteTx}
        onOpenChange={(open) => !open && setDeleteTx(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete transaction?</DialogTitle>
            <DialogDescription>
              This will permanently delete the{" "}
              <span className="font-medium text-foreground">
                {deleteTx?.categoryName}
              </span>{" "}
              transaction of{" "}
              <span className="font-medium text-foreground">
                {deleteTx?.amount}
              </span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTx(null)}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
