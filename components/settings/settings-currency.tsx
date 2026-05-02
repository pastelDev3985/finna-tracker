"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/currency";
import { updateCurrencyAction } from "@/lib/actions/settings";

interface SettingsCurrencyProps {
  defaultCurrency: string;
}

export function SettingsCurrency({ defaultCurrency }: SettingsCurrencyProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);

  const currentCurrency = SUPPORTED_CURRENCIES.find(
    (c) => c.code === selectedCurrency,
  );

  const handleSelect = async (currency: SupportedCurrency) => {
    setOpen(false);
    if (currency.code === selectedCurrency) return;

    setIsLoading(true);
    try {
      const result = await updateCurrencyAction({ currency: currency.code });
      if (result.error) {
        toast.error(result.error);
        setSelectedCurrency(selectedCurrency);
      } else {
        setSelectedCurrency(currency.code);
        toast.success(`Currency changed to ${currency.name}`);
      }
    } catch {
      toast.error("Failed to update currency");
      setSelectedCurrency(selectedCurrency);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-[16px] bg-white/[0.08] dark:bg-[rgba(32,32,32,0.6)] border border-white/[0.15] p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Select Currency</h3>
          <p className="text-xs text-muted mb-4">
            This only changes the display format. All amounts will be shown in
            the currency you select, but no conversion is performed.
          </p>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={isLoading}
                />
              }
            >
              {currentCurrency ? (
                <span>
                  {currentCurrency.symbol} • {currentCurrency.code} —{" "}
                  {currentCurrency.name}
                </span>
              ) : (
                "Select currency..."
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search currencies..." />
                <CommandEmpty>No currency found.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-y-auto">
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <CommandItem
                      key={currency.code}
                      value={currency.code}
                      onSelect={() => handleSelect(currency)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCurrency === currency.code
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {currency.symbol} • {currency.code} — {currency.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="text-xs text-muted p-3 bg-bg-muted rounded-lg">
          Current selection: <strong>{currentCurrency?.name}</strong> (
          {currentCurrency?.symbol})
        </div>
      </div>
    </Card>
  );
}
