"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { changePasswordAction } from "@/lib/actions/settings"

const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { error: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(1, { error: "Please confirm your password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type PasswordFormData = z.infer<typeof PasswordSchema>

export function SettingsPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(PasswordSchema),
  })

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true)
    try {
      const result = await changePasswordAction(data)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Password changed successfully")
        reset()
      }
    } catch (error) {
      toast.error("Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  const PasswordInput = ({
    id,
    label,
    field,
    showKey,
  }: {
    id: string
    label: string
    field: "currentPassword" | "newPassword" | "confirmPassword"
    showKey: "current" | "new" | "confirm"
  }) => (
    <div>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative mt-2">
        <Input
          id={id}
          type={showPasswords[showKey] ? "text" : "password"}
          {...register(field)}
          disabled={isLoading}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() =>
            setShowPasswords((prev) => ({
              ...prev,
              [showKey]: !prev[showKey],
            }))
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
          tabIndex={-1}
        >
          {showPasswords[showKey] ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      {errors[field] && (
        <p className="text-xs text-error mt-1">{errors[field]?.message}</p>
      )}
    </div>
  )

  return (
    <Card className="backdrop-blur-[16px] bg-white/[0.08] dark:bg-[rgba(32,32,32,0.6)] border border-white/[0.15] p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <PasswordInput
            id="currentPassword"
            label="Current Password"
            field="currentPassword"
            showKey="current"
          />
          <PasswordInput
            id="newPassword"
            label="New Password"
            field="newPassword"
            showKey="new"
          />
          <PasswordInput
            id="confirmPassword"
            label="Confirm New Password"
            field="confirmPassword"
            showKey="confirm"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-secondary font-semibold rounded-lg hover:-translate-y-px transition-all duration-200"
        >
          {isLoading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </Card>
  )
}
