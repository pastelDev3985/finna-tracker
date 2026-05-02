"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/lib/actions/settings";

const ProfileSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }).trim(),
  email: z.string().email({ error: "Invalid email address" }).trim(),
});

type ProfileFormData = z.infer<typeof ProfileSchema>;

interface SettingsProfileProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
}

export function SettingsProfile({ user }: SettingsProfileProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user.name ?? "",
      email: user.email ?? "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const result = await updateProfileAction(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated successfully");
        reset(data);
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass p-4 sm:p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name")}
              disabled={isLoading}
              className="mt-2"
            />
            {errors.name && (
              <p className="text-xs text-error mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register("email")}
              disabled={isLoading}
              className="mt-2"
            />
            {errors.email && (
              <p className="text-xs text-error mt-1">{errors.email.message}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Changing your email may require re-verification.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-primary font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-px"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
