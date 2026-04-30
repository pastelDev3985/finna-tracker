"use client"

import { Loader2 } from "lucide-react"
import { useState, useTransition } from "react"
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
import { upsertBudgetAction } from "@/lib/actions/budgets"

interface Category {
  id: string
  name: string
}

interface BudgetFormProps {
  categories: Category[]
  currencySymbol: string
  month: number
  year: number
  defaultValues?: {
    categoryId: string
    limitAmount: string
  }
  onSuccess?: () => void
}

const schema = z.object({
  categoryId: z.string().min(1, { error: "Category is required" }),
  limitAmount: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      error: "Enter a valid positive amount",
    }),
})

type FieldErrors = Partial<Record<"categoryId" | "limitAmount", string>>

export function BudgetForm({
  categories,
  currencySymbol,
  month,
  year,
  defaultValues,
  onSuccess,
}: BudgetFormProps) {
  const [isPending, startTransition] = useTransition()
  const [categoryId, setCategoryId] = useState(defaultValues?.categoryId ?? "")
  const [limitAmount, setLimitAmount] = useState(defaultValues?.limitAmount ?? "")
  const [errors, setErrors] = useState<FieldErrors>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const parsed = schema.safeParse({ categoryId, limitAmount })
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      setErrors({
        categoryId: flat.categoryId?.[0],
        limitAmount: flat.limitAmount?.[0],
      })
      return
    }

    startTransition(async () => {
      const result = await upsertBudgetAction({
        categoryId: parsed.data.categoryId,
        limitAmount: parsed.data.limitAmount,
        month,
        year,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Budget saved.")
      onSuccess?.()
    })
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="budget-category">Category</Label>
        <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)} disabled={isPending || !!defaultValues?.categoryId}>
          <SelectTrigger id="budget-category" aria-invalid={!!errors.categoryId}>
            <SelectValue placeholder="Select expense category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && <p className="text-xs text-destructive" role="alert">{errors.categoryId}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="budget-amount">Monthly limit</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground select-none">
            {currencySymbol}
          </span>
          <Input
            id="budget-amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={limitAmount}
            onChange={(e) => setLimitAmount(e.target.value)}
            className="pl-8"
            placeholder="0.00"
            disabled={isPending}
            aria-invalid={!!errors.limitAmount}
          />
        </div>
        {errors.limitAmount && <p className="text-xs text-destructive" role="alert">{errors.limitAmount}</p>}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="mt-1 h-11 w-full cursor-pointer font-semibold transition-all duration-200 hover:-translate-y-px"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Saving…
          </>
        ) : (
          "Save budget"
        )}
      </Button>
    </form>
  )
}
