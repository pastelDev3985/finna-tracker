"use client";

import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  Sparkles,
  Target,
  Wallet,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTransactionAction } from "@/lib/actions/transactions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Dashboard overview",
    desc: "See income, expenses, and net balance at a glance.",
  },
  {
    icon: Wallet,
    title: "Smart budgeting",
    desc: "Set monthly limits per category and track overspending.",
  },
  {
    icon: Target,
    title: "Savings goals",
    desc: "Create goals, add contributions, and hit your targets.",
  },
  {
    icon: Sparkles,
    title: "AI insights",
    desc: "Chat with your financial data powered by Claude.",
  },
];

interface OnboardingClientProps {
  userName: string;
  categories: Array<{ id: string; name: string; type: "INCOME" | "EXPENSE" }>;
}

export function OnboardingClient({
  userName,
  categories,
}: OnboardingClientProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const firstIncomeCategory =
    incomeCategories.length > 0 ? incomeCategories[0] : null;

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-16">
      <div className="glass-light w-full max-w-lg rounded-2xl border border-border-light p-8">
        {step === 1 ? (
          <Step1 userName={userName} onNext={() => setStep(2)} />
        ) : step === 2 ? (
          <Step2 onNext={() => setStep(3)} />
        ) : (
          <Step3
            onBack={() => setStep(2)}
            firstIncomeCategory={firstIncomeCategory}
          />
        )}
      </div>
    </div>
  );
}

function Step1({ userName, onNext }: { userName: string; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="flex flex-col items-center gap-3">
        {/* <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="size-7 text-primary" aria-hidden />
        </div> */}
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Welcome, {userName}!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Finora is your personal finance companion. Let&apos;s get you set up
            in 2 minutes.
          </p>
        </div>
      </div>

      <div className="grid gap-3 text-left">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="size-4 text-primary" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={onNext}
        className="h-12 w-full cursor-pointer font-semibold transition-all duration-200 hover:-translate-y-px"
      >
        Get started
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

function Step2({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--color-success)]/10">
          <CheckCircle2
            className="size-7 text-[var(--color-success)]"
            aria-hidden
          />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">
            Default categories added
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ve added 15 categories for income and expenses. Customise
            them anytime in Settings.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4 text-left">
        <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Categories
        </p>
        <div className="grid grid-cols-2 gap-1">
          {[
            "Salary",
            "Freelance",
            "Business",
            "Investment",
            "Other Income",
            "Food & Drink",
            "Transport",
            "Housing",
            "Utilities",
            "Healthcare",
            "Shopping",
            "Entertainment",
            "Education",
            "Savings Transfer",
            "Other",
          ].map((cat) => (
            <p key={cat} className="text-xs text-muted-foreground">
              · {cat}
            </p>
          ))}
        </div>
      </div>

      <Button
        onClick={onNext}
        className="h-12 w-full cursor-pointer font-semibold transition-all duration-200 hover:-translate-y-px"
      >
        Continue
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

function Step3({
  onBack,
  firstIncomeCategory,
}: {
  onBack: () => void;
  firstIncomeCategory: {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
  } | null;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleAddIncome = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!firstIncomeCategory) {
      toast.error("Income category not found");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createTransactionAction({
        type: "INCOME",
        categoryId: firstIncomeCategory.id,
        amount: amount.trim(),
        date: new Date(),
        note: note.trim() || undefined,
        recurrence: "NONE",
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Income added! Heading to your dashboard...");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Wallet className="size-7 text-primary" aria-hidden />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">
            Add your first income
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            (Optional) Record an income entry to get started. You can add more
            later.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label
            htmlFor="amount"
            className="text-sm font-medium text-foreground"
          >
            Amount
          </Label>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-semibold text-muted-foreground">
              ₵
            </span>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              min="0"
              step="0.01"
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="note" className="text-sm font-medium text-foreground">
            Note (optional)
          </Label>
          <Input
            id="note"
            placeholder="e.g. Monthly salary"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isLoading}
            className="mt-2"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={handleAddIncome}
          disabled={isLoading || !amount || !firstIncomeCategory}
          className="h-12 w-full cursor-pointer font-semibold transition-all duration-200 hover:-translate-y-px"
        >
          {isLoading ? "Adding..." : "Add income"}
          <ArrowRight className="size-4" aria-hidden />
        </Button>

        <Button
          onClick={handleSkip}
          disabled={isLoading}
          variant="outline"
          className="h-12 w-full cursor-pointer font-semibold transition-all duration-200"
        >
          Skip for now
        </Button>
      </div>

      <button
        onClick={onBack}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground disabled:opacity-50"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back
      </button>
    </div>
  );
}
