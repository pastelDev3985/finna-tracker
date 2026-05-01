"use client"

import { Loader2 } from "lucide-react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/lib/actions/transactions"

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
  type: "INCOME" | "EXPENSE"
}

interface TransactionFormProps {
  categories: Category[]
  currencySymbol: string
  mode?: "create" | "edit"
  defaultValues?: {
    id: string
    categoryId: string
    type: "INCOME" | "EXPENSE"
    amount: string
    date: string
    note: string | null
    recurrence: string
  }
  onSuccess?: () => void
}

// ─── Validation ────────────────────────────────────────────────────────────────

const schema = z.object({
  categoryId: z.string().min(1, { error: "Category is required" }),
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
    error: "Enter a valid positive amount",
  }),
  date: z.string().min(1, { error: "Date is required" }),
  note: z.string().optional(),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
})

type FieldErrors = Partial<Record<string, string>>

// ─── Component ─────────────────────────────────────────────────────────────────

export function TransactionForm({
  categories,
  currencySymbol,
  mode = "create",
  defaultValues,
  onSuccess,
}: TransactionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [type, setType] = useState<"INCOME" | "EXPENSE">(defaultValues?.type ?? "EXPENSE")
  const [categoryId, setCategoryId] = useState(defaultValues?.categoryId ?? "")
  const [amount, setAmount] = useState(defaultValues?.amount ?? "")
  const [date, setDate] = useState(
    defaultValues?.date ?? new Date().toISOString().slice(0, 10)
  )
  const [note, setNote] = useState(defaultValues?.note ?? "")
  const [recurrence, setRecurrence] = useState(defaultValues?.recurrence ?? "NONE")
  const [errors, setErrors] = useState<FieldErrors>({})

  const filteredCategories = categories.filter((c) => c.type === type)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const parsed = schema.safeParse({ categoryId, type, amount, date, note: note || undefined, recurrence })
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      setErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0]])))
      return
    }

    startTransition(async () => {
      const payload = { ...parsed.data, date: new Date(date).toISOString() }
      const result =
        mode === "edit" && defaultValues?.id
          ? await updateTransactionAction(defaultValues.id, payload)
          : await createTransactionAction(payload)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(mode === "edit" ? "Transaction updated." : "Transaction added.")
      if (onSuccess) {
        onSuccess()
      } else if (mode === "create") {
        router.push("/transactions")
      }
    })
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      {/* Type toggle */}
      <div className="grid gap-1.5">
        <Label>Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["EXPENSE", "INCOME"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setCategoryId("") }}
              className={cn(
                "h-9 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer",
                type === t
                  ? t === "INCOME"
                    ? "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]"
                    : "border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)]"
                  : "border-border bg-transparent text-muted-foreground hover:border-border-medium hover:text-foreground"
              )}
            >
              {t === "INCOME" ? "Income" : "Expense"}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="grid gap-1.5">
        <Label htmlFor="tx-amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground select-none">
            {currencySymbol}
          </span>
          <Input
            id="tx-amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-8"
            placeholder="0.00"
            disabled={isPending}
            aria-invalid={!!errors.amount}
          />
        </div>
        {errors.amount && <p className="text-xs text-destructive" role="alert">{errors.amount}</p>}
      </div>

      {/* Category */}
      <div className="grid gap-1.5">
        <Label htmlFor="tx-category">Category</Label>
        <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)} disabled={isPending}>
          <SelectTrigger id="tx-category" aria-invalid={!!errors.categoryId}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.length === 0 ? (
              <SelectItem value="__empty" disabled>
                No categories for {type.toLowerCase()}
              </SelectItem>
            ) : (
              filteredCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errors.categoryId && <p className="text-xs text-destructive" role="alert">{errors.categoryId}</p>}
      </div>

      {/* Date */}
      <div className="grid gap-1.5">
        <Label htmlFor="tx-date">Date</Label>
        <Input
          id="tx-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={isPending}
          aria-invalid={!!errors.date}
        />
        {errors.date && <p className="text-xs text-destructive" role="alert">{errors.date}</p>}
      </div>

      {/* Note */}
      <div className="grid gap-1.5">
        <Label htmlFor="tx-note">Note <span className="text-muted-foreground">(optional)</span></Label>
        <Input
          id="tx-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Grocery run"
          disabled={isPending}
        />
      </div>

      {/* Recurrence */}
      <div className="grid gap-1.5">
        <Label htmlFor="tx-recurrence">Recurrence</Label>
        <Select value={recurrence} onValueChange={(v) => v && setRecurrence(v)} disabled={isPending}>
          <SelectTrigger id="tx-recurrence">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">One-time</SelectItem>
            <SelectItem value="DAILY">Daily</SelectItem>
            <SelectItem value="WEEKLY">Weekly</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
            <SelectItem value="YEARLY">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="mt-1 h-11 w-full cursor-pointer font-semibold transition-all duration-200 hover:-translate-y-px"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {mode === "edit" ? "Saving…" : "Adding…"}
          </>
        ) : mode === "edit" ? (
          "Save changes"
        ) : (
          "Add transaction"
        )}
      </Button>
    </form>
  )
}
