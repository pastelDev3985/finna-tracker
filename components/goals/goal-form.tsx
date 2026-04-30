"use client"

import { Loader2 } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createGoalAction, updateGoalAction } from "@/lib/actions/goals"

interface GoalFormProps {
  currencySymbol: string
  mode?: "create" | "edit"
  defaultValues?: {
    id: string
    name: string
    targetAmount: string
    deadline: string | null
  }
  onSuccess?: () => void
}

const schema = z.object({
  name: z.string().min(1, { error: "Name is required" }).trim(),
  targetAmount: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
    error: "Enter a valid positive amount",
  }),
  deadline: z.string().optional(),
})

type FieldErrors = Partial<Record<"name" | "targetAmount" | "deadline", string>>

export function GoalForm({
  currencySymbol,
  mode = "create",
  defaultValues,
  onSuccess,
}: GoalFormProps) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(defaultValues?.name ?? "")
  const [targetAmount, setTargetAmount] = useState(defaultValues?.targetAmount ?? "")
  const [deadline, setDeadline] = useState(defaultValues?.deadline ?? "")
  const [errors, setErrors] = useState<FieldErrors>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const parsed = schema.safeParse({ name, targetAmount, deadline: deadline || undefined })
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      setErrors({
        name: flat.name?.[0],
        targetAmount: flat.targetAmount?.[0],
      })
      return
    }

    startTransition(async () => {
      const payload = {
        name: parsed.data.name,
        targetAmount: parsed.data.targetAmount,
        deadline: parsed.data.deadline
          ? new Date(parsed.data.deadline).toISOString()
          : undefined,
      }

      const result =
        mode === "edit" && defaultValues?.id
          ? await updateGoalAction(defaultValues.id, payload)
          : await createGoalAction(payload)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(mode === "edit" ? "Goal updated." : "Goal created.")
      onSuccess?.()
    })
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="goal-name">Goal name</Label>
        <Input
          id="goal-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Emergency fund"
          disabled={isPending}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-xs text-destructive" role="alert">{errors.name}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="goal-target">Target amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground select-none">
            {currencySymbol}
          </span>
          <Input
            id="goal-target"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="pl-8"
            placeholder="0.00"
            disabled={isPending}
            aria-invalid={!!errors.targetAmount}
          />
        </div>
        {errors.targetAmount && <p className="text-xs text-destructive" role="alert">{errors.targetAmount}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="goal-deadline">
          Deadline <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="goal-deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          disabled={isPending}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="mt-1 h-11 w-full cursor-pointer font-semibold transition-all duration-200 hover:-translate-y-px"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {mode === "edit" ? "Saving…" : "Creating…"}
          </>
        ) : mode === "edit" ? (
          "Save changes"
        ) : (
          "Create goal"
        )}
      </Button>
    </form>
  )
}
