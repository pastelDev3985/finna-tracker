"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Trash2, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/lib/actions/categories";

const CategorySchema = z.object({
  name: z.string().min(1, { error: "Name is required" }).trim(),
  type: z.enum(["INCOME", "EXPENSE"]),
});

type CategoryFormData = z.infer<typeof CategorySchema>;

interface Category {
  id: string;
  name: string;
  type: string;
  color?: string | null;
  icon?: string | null;
}

interface SettingsCategoriesProps {
  initialCategories: Category[];
}

export function SettingsCategories({
  initialCategories,
}: SettingsCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      type: "EXPENSE",
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    try {
      if (editingId) {
        const result = await updateCategoryAction(editingId, data);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Category updated");
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...data } : c)),
        );
        setEditingId(null);
      } else {
        const result = await createCategoryAction(data);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Category created");
        if (result.data) {
          setCategories((prev) => [...prev, result.data as Category]);
        }
      }
      reset();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setValue("name", category.name);
    setValue("type", category.type as "INCOME" | "EXPENSE");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Delete this category? If it has no transactions, it will be removed.",
      )
    )
      return;

    setIsLoading(true);
    try {
      const result = await deleteCategoryAction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category deleted");
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setIsLoading(false);
    }
  };

  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <Card className="backdrop-blur-[16px] bg-white/[0.08] dark:bg-[rgba(32,32,32,0.6)] border border-white/[0.15] p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Manage Categories</h3>
            <p className="text-xs text-muted mt-1">
              Add, rename, or remove expense and income categories.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <Button className="bg-primary text-secondary font-semibold rounded-lg hover:-translate-y-px transition-all duration-200 gap-2">
                <Plus className="w-4 h-4" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Category" : "Add Category"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Category Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Groceries"
                    {...register("name")}
                    className="mt-2"
                  />
                  {errors.name && (
                    <p className="text-xs text-error mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm font-medium">
                    Type
                  </Label>
                  <Select
                    value={watch("type")}
                    onValueChange={(value) =>
                      setValue("type", value as "INCOME" | "EXPENSE")
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCOME">Income</SelectItem>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-xs text-error mt-1">
                      {errors.type.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-secondary font-semibold rounded-lg hover:-translate-y-px transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading
                    ? "Creating..."
                    : editingId
                      ? "Update Category"
                      : "Create Category"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {categories && categories.length > 0 ? (
          <div className="space-y-6">
            {incomeCategories.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted uppercase mb-3">
                  Income
                </h4>
                <div className="space-y-2">
                  {incomeCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium">{category.name}</p>
                        <Badge
                          variant="outline"
                          className="text-success border-success/30"
                        >
                          Income
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-muted hover:text-primary transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-muted hover:text-error transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expenseCategories.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted uppercase mb-3">
                  Expenses
                </h4>
                <div className="space-y-2">
                  {expenseCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium">{category.name}</p>
                        <Badge
                          variant="outline"
                          className="text-error border-error/30"
                        >
                          Expense
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-muted hover:text-primary transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-muted hover:text-error transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted py-4">No categories found.</p>
        )}
      </div>
    </Card>
  );
}
