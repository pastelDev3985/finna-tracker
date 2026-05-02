"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteAccountAction } from "@/lib/actions/settings";

const DeleteAccountSchema = z.object({
  password: z.string().min(1, { error: "Password is required" }),
});

type DeleteAccountFormData = z.infer<typeof DeleteAccountSchema>;

export function SettingsDangerZone() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(DeleteAccountSchema),
  });

  const onSubmit = async (data: DeleteAccountFormData) => {
    setIsLoading(true);
    try {
      const result = await deleteAccountAction(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Account deleted. Signing out...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await signOut({ callbackUrl: "/login" });
      }
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-[16px] bg-white/[0.08] dark:bg-[rgba(32,32,32,0.6)] border border-error/30 p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-error flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete Account
          </h3>
          <p className="text-xs text-muted-foreground mt-2">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <Button
              variant="destructive"
              className="bg-error text-white hover:bg-error/90 rounded-lg transition-all duration-200"
            >
              Delete My Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-error">Delete Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-error/10 rounded-lg border border-error/20">
                <p className="text-sm font-medium text-error">
                  This action is permanent and cannot be undone.
                </p>
                <p className="text-xs text-muted mt-2">
                  All your data, including transactions, budgets, goals, and
                  categories, will be permanently deleted.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="password" className="text-sm font-medium">
                    Enter your password to confirm
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      {...register("password")}
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-error mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      reset();
                    }}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-error text-white hover:bg-error/90 transition-all duration-200"
                  >
                    {isLoading ? "Deleting..." : "Delete Account"}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
