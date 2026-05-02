"use client";

import { useState } from "react";
import { useForm, UseFormRegister, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { changePasswordAction } from "@/lib/actions/settings";

const PasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof PasswordSchema>;

interface PasswordInputProps {
  id: string;
  label: string;
  field: "currentPassword" | "newPassword" | "confirmPassword";
  showKey: "current" | "new" | "confirm";
  showPasswords: { current: boolean; new: boolean; confirm: boolean };
  setShowPasswords: (value: {
    current: boolean;
    new: boolean;
    confirm: boolean;
  }) => void;
  isLoading: boolean;
  register: UseFormRegister<PasswordFormData>;
  errors: FieldErrors<PasswordFormData>;
}

const PasswordInput = ({
  id,
  label,
  field,
  showKey,
  showPasswords,
  setShowPasswords,
  isLoading,
  register,
  errors,
}: PasswordInputProps) => (
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
          setShowPasswords({
            ...showPasswords,
            [showKey]: !showPasswords[showKey],
          })
        }
        aria-label={showPasswords[showKey] ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
      >
        {showPasswords[showKey] ? (
          <EyeOff className="w-4 h-4" aria-hidden />
        ) : (
          <Eye className="w-4 h-4" aria-hidden />
        )}
      </button>
    </div>
    {errors[field] && (
      <p className="text-xs text-error mt-1">{errors[field]?.message}</p>
    )}
  </div>
);

export function SettingsPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(PasswordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      const result = await changePasswordAction(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Password changed successfully");
        reset();
      }
    } catch {
      toast.error("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-[16px] bg-white/[0.08] dark:bg-[rgba(32,32,32,0.6)] border border-white/[0.15] p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <PasswordInput
            id="currentPassword"
            label="Current Password"
            field="currentPassword"
            showKey="current"
            showPasswords={showPasswords}
            setShowPasswords={setShowPasswords}
            isLoading={isLoading}
            register={register}
            errors={errors}
          />
          <PasswordInput
            id="newPassword"
            label="New Password"
            field="newPassword"
            showKey="new"
            showPasswords={showPasswords}
            setShowPasswords={setShowPasswords}
            isLoading={isLoading}
            register={register}
            errors={errors}
          />
          <PasswordInput
            id="confirmPassword"
            label="Confirm New Password"
            field="confirmPassword"
            showKey="confirm"
            showPasswords={showPasswords}
            setShowPasswords={setShowPasswords}
            isLoading={isLoading}
            register={register}
            errors={errors}
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
  );
}
