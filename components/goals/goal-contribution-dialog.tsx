"use client"

import { Loader2 } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { addContributionAction } from "@/lib/actions/goals"
import { sanitizeAmountInput } from "@/lib/exchange-rate-core"

const schema = z.object({
  amount: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
    error: "Enter a valid positive amount",
  }),
  date: z.string().min(1, { error: "Date is required" }),
  note: z.string().trim().optional(),
})

type FieldErrors = Partial<Record<"amount" | "date", string>>

interface GoalContributionDialogProps {
  goalId: string
  goalName: string
  currencySymbol: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded?: () => void
}

export function GoalContributionDialog({
  goalId,
  goalName,
  currencySymbol,
  open,
  onOpenChange,
  onAdded,
}: GoalContributionDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (!open) return
    setAmount("")
    setDate(new Date().toISOString().slice(0, 10))
    setNote("")
    setErrors({})
  }, [open, goalId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    const parsed = schema.safeParse({
      amount,
      date,
      note: note.trim() === "" ? undefined : note.trim(),
    })
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      setErrors({
        amount: flat.amount?.[0],
        date: flat.date?.[0],
      })
      return
    }

    startTransition(async () => {
      const result = await addContributionAction(goalId, {
        amount: parsed.data.amount,
        date: new Date(parsed.data.date).toISOString(),
        ...(parsed.data.note ? { note: parsed.data.note } : {}),
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Contribution saved.")
      onOpenChange(false)
      onAdded?.()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add contribution</DialogTitle>
          <DialogDescription>
            Record money toward{" "}
            <span className="font-medium text-foreground">{goalName}</span>.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="contribution-amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground select-none">
                {currencySymbol}
              </span>
              <Input
                id="contribution-amount"
                inputMode="decimal"
                autoComplete="off"
                value={amount}
                onChange={(e) => setAmount(sanitizeAmountInput(e.target.value))}
                className="pl-8"
                placeholder="0.00"
                disabled={isPending}
                aria-invalid={!!errors.amount}
              />
            </div>
            {errors.amount ? (
              <p className="text-xs text-destructive" role="alert">
                {errors.amount}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="contribution-date">Date</Label>
            <Input
              id="contribution-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isPending}
              aria-invalid={!!errors.date}
            />
            {errors.date ? (
              <p className="text-xs text-destructive" role="alert">
                {errors.date}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="contribution-note">
              Note <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="contribution-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Monthly transfer"
              rows={2}
              disabled={isPending}
              className="min-h-[4.5rem] resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer font-semibold"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save contribution"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
