"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  POPULAR_CONVERSION_TARGETS,
  convertAmount,
  sanitizeAmountInput,
  type LatestRatesPayload,
} from "@/lib/exchange-rate-core";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

async function consumeRatesResponse(res: Response): Promise<
  | { ok: true; payload: LatestRatesPayload }
  | { ok: false; message: string }
> {
  const raw = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (res.status === 401) {
    return { ok: false, message: "Sign in required." };
  }
  if (!res.ok) {
    return {
      ok: false,
      message:
        typeof raw.message === "string"
          ? raw.message
          : "Could not load rates.",
    };
  }
  if (raw.noSnapshot === true) {
    return {
      ok: false,
      message:
        typeof raw.message === "string"
          ? raw.message
          : "No exchange rates yet. Run a sync first.",
    };
  }
  if (
    typeof raw.fetchedAt === "string" &&
    raw.rates &&
    typeof raw.rates === "object"
  ) {
    return { ok: true, payload: raw as unknown as LatestRatesPayload };
  }
  return { ok: false, message: "Invalid rates response." };
}

interface Props {
  userCurrency: string;
  initialPayload: LatestRatesPayload | null;
}

/** Round and format money for display (2 fraction digits, locale-aware grouping). */
function formatMoney2(r: number): string {
  if (!Number.isFinite(r)) return "—";
  const rounded = Number.parseFloat(r.toFixed(2));
  return rounded.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function CurrencyBadge({
  code,
  variant,
}: {
  code: string;
  variant: "base" | "target";
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 min-w-10 items-center justify-center rounded-lg px-2.5 font-mono text-xs font-bold tabular-nums tracking-wide",
        variant === "base"
          ? "bg-primary/20 text-primary ring-1 ring-primary/25 dark:bg-primary/25"
          : "bg-chart-2/20 text-chart-2 ring-1 ring-chart-2/30 dark:bg-chart-2/25",
      )}
      aria-label={`${variant} currency ${code}`}
    >
      {code}
    </span>
  );
}

function ArrowPair({
  base,
  target,
}: {
  base: string;
  target: string;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2">
      <CurrencyBadge code={base} variant="base" />
      <span className="text-muted-foreground" aria-hidden>
        →
      </span>
      <CurrencyBadge code={target} variant="target" />
    </span>
  );
}

function CommonRow({
  base,
  target,
  rates,
  targetName,
  baseAmountNum,
}: {
  base: string;
  target: string;
  rates: Record<string, number>;
  targetName?: string;
  /** Parsed amount in `base`; null if invalid so rows show — */
  baseAmountNum: number | null;
}) {
  let converted: number | null = null;
  let spotRate: number | null = null;
  try {
    spotRate = convertAmount(1, base, target, rates).rate;
  } catch {
    spotRate = null;
  }
  if (baseAmountNum != null) {
    try {
      converted = convertAmount(baseAmountNum, base, target, rates).converted;
    } catch {
      converted = null;
    }
  }

  return (
    <div className="glass rounded-2xl border border-border/80 p-3 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-col gap-1">
            <ArrowPair base={base} target={target} />
            {targetName && (
              <p className="pl-0.5 text-xs text-muted-foreground">{targetName}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            <span className="text-muted-foreground">Spot rate · </span>
            <span className="font-mono tabular-nums text-foreground/90">
              1 {base}
            </span>
            <span className="mx-1 text-muted-foreground">=</span>
            <span className="font-mono text-sm font-semibold tabular-nums text-chart-3 dark:text-chart-4">
              {spotRate != null ? formatMoney2(spotRate) : "—"}
            </span>
            <span className="mx-1 font-mono text-sm font-bold tabular-nums text-chart-2">
              {target}
            </span>
          </p>
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-1 rounded-xl bg-muted/35 p-3 ring-1 ring-border/60 sm:w-[min(100%,12.5rem)] sm:p-3.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
            Your amount
          </p>
          <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
            <span className="font-mono text-base font-bold tabular-nums text-primary sm:text-lg">
              {converted != null ? formatMoney2(converted) : "—"}
            </span>
            <CurrencyBadge code={target} variant="target" />
          </p>
        </div>
      </div>
    </div>
  );
}

export function CurrencyToolsClient({
  userCurrency,
  initialPayload,
}: Props) {
  const [payload, setPayload] = useState<LatestRatesPayload | null>(
    initialPayload,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [baseAmount, setBaseAmount] = useState("1");

  useEffect(() => {
    if (initialPayload) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/rates");
        const out = await consumeRatesResponse(res);
        if (!cancelled) {
          if (!out.ok) setLoadError(out.message);
          else setPayload(out.payload);
        }
      } catch {
        if (!cancelled) setLoadError("Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialPayload]);

  const user = userCurrency.toUpperCase();
  const rates = payload?.rates ?? {};

  const baseAmountNum = useMemo(() => {
    const n = parseFloat(baseAmount);
    if (Number.isNaN(n) || !Number.isFinite(n)) return null;
    return n;
  }, [baseAmount]);

  const availablePopular = useMemo(() => {
    return POPULAR_CONVERSION_TARGETS.filter(
      (code) =>
        code !== user &&
        rates[code] !== undefined &&
        rates[user] !== undefined,
    );
  }, [rates, user]);

  const totalPages = Math.max(
    1,
    Math.ceil(availablePopular.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages - 1);
  const slice = availablePopular.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 1) return [];
    return SUPPORTED_CURRENCIES.filter((c) => {
      if (c.code === user) return false;
      if (rates[c.code] === undefined) return false;
      return (
        c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      );
    }).slice(0, 14);
  }, [searchQuery, rates, user]);

  const refresh = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/rates");
      const out = await consumeRatesResponse(res);
      if (!out.ok) {
        setLoadError(out.message);
        setPayload(null);
        return;
      }
      setPayload(out.payload);
    } catch {
      setLoadError("Network error");
    }
  }, []);

  const syncRatesFromProvider = useCallback(async () => {
    setLoadError(null);
    setSyncing(true);
    try {
      const res = await fetch("/api/rates/sync", { method: "POST" });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setLoadError(
          typeof j.error === "string"
            ? j.error
            : "Could not sync exchange rates.",
        );
        return;
      }
      await refresh();
    } catch {
      setLoadError("Network error");
    } finally {
      setSyncing(false);
    }
  }, [refresh]);

  const userMissingInRates =
    payload && rates[user] === undefined;

  if (loadError && !payload) {
    return (
      <div className="glass rounded-2xl border border-border/80 p-6 text-center">
        <p className="text-sm text-muted-foreground">{loadError}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          After you sign in, <strong className="font-medium">Sync rates now</strong> calls{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
            POST /api/rates/sync
          </code>
          . Scheduled jobs use{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
            /api/cron/update-rates
          </code>{" "}
          with{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
            Authorization: Bearer
          </code>{" "}
          when{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[10px]">CRON_SECRET</code>{" "}
          is set on Vercel.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            disabled={syncing}
            onClick={syncRatesFromProvider}
          >
            {syncing ? "Syncing…" : "Sync rates now"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={syncing}
            onClick={refresh}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-sm text-muted-foreground">Loading rates…</p>
      </div>
    );
  }

  const fetchedLabel = new Date(payload.fetchedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  let selectedMeta = selectedCode
    ? SUPPORTED_CURRENCIES.find((c) => c.code === selectedCode)
    : undefined;
  let rateToSelected: number | null = null;
  let rateFromSelected: number | null = null;
  let convToSelected: number | null = null;
  if (selectedCode && rates[user] !== undefined) {
    try {
      rateToSelected = convertAmount(1, user, selectedCode, rates).rate;
      rateFromSelected = convertAmount(1, selectedCode, user, rates).rate;
      if (baseAmountNum != null) {
        convToSelected = convertAmount(
          baseAmountNum,
          user,
          selectedCode,
          rates,
        ).converted;
      }
    } catch {
      rateToSelected = null;
      rateFromSelected = null;
      convToSelected = null;
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:gap-8">
      <div className="glass flex flex-col gap-2 rounded-2xl border border-border/80 border-l-4 border-l-primary/55 p-3 shadow-sm sm:p-4">
        <label
          htmlFor="global-base-amount"
          className="text-sm font-medium text-foreground"
        >
          Amount in{" "}
          <span className="font-mono font-semibold text-primary tabular-nums">
            {user}
          </span>
        </label>
        <p className="text-xs text-muted-foreground">
          One entry updates every common pair and the currency you pick in search.
        </p>
        <Input
          id="global-base-amount"
          inputMode="decimal"
          value={baseAmount}
          onChange={(e) =>
            setBaseAmount(sanitizeAmountInput(e.target.value))
          }
          className="min-h-11 font-mono text-base font-medium tabular-nums sm:text-sm"
          placeholder={`e.g. 100`}
          autoComplete="off"
          aria-describedby="global-base-amount-hint"
        />
        <p id="global-base-amount-hint" className="text-[10px] text-muted-foreground sm:text-xs">
          {baseAmountNum == null && baseAmount.trim() !== ""
            ? "Enter a valid number to see converted amounts."
            : baseAmount.trim() === "" && baseAmountNum == null
              ? "Enter an amount above to see results in every pair."
              : `Showing conversions for ${baseAmountNum != null ? formatMoney2(baseAmountNum) : "—"} ${user}.`}
        </p>
      </div>

      <div className="glass flex flex-col gap-2 rounded-2xl border border-border/80 p-3 shadow-sm sm:p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Data source
        </p>
        <p className="text-sm text-foreground">
          Cached snapshot · base{" "}
          <span className="font-mono font-semibold text-primary tabular-nums">
            {payload.baseCurrency}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Updated locally:{" "}
          <span className="font-medium tabular-nums text-foreground/90">
            {fetchedLabel}
          </span>
        </p>
      </div>

      {userMissingInRates && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">
          Your account currency ({user}) is not in the current rate table.
          Choose another supported currency in Settings, or wait for a snapshot
          that includes it.
        </div>
      )}

      <section
        aria-labelledby="common-heading"
        className="flex flex-col gap-3 sm:gap-4"
      >
        <div className="flex flex-col gap-3 min-[400px]:flex-row min-[400px]:items-end min-[400px]:justify-between">
          <div className="min-w-0">
            <h2
              id="common-heading"
              className="font-heading text-lg font-semibold text-foreground"
            >
              Common conversions
            </h2>
            <p className="text-pretty text-xs text-muted-foreground sm:text-sm">
              Pairs from your currency (
              <span className="font-mono font-semibold text-primary">
                {user}
              </span>
              ) to popular targets · {availablePopular.length} available · page{" "}
              {safePage + 1} / {totalPages}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-stretch min-[400px]:self-auto">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 shrink-0 sm:size-9"
              disabled={safePage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 shrink-0 sm:size-9"
              disabled={safePage >= totalPages - 1}
              onClick={() =>
                setPage((p) => Math.min(totalPages - 1, p + 1))
              }
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {slice.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No popular pairs available for {user}. Try search below.
          </p>
        ) : (
          <ul className="flex flex-col gap-3 sm:gap-3.5">
            {slice.map((code) => {
              const meta = SUPPORTED_CURRENCIES.find((c) => c.code === code);
              return (
                <li key={`${user}-${code}`}>
                  <CommonRow
                    base={user}
                    target={code}
                    rates={rates}
                    targetName={meta?.name}
                    baseAmountNum={baseAmountNum}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section
        aria-labelledby="search-heading"
        className="flex flex-col gap-3 sm:gap-4"
      >
        <h2
          id="search-heading"
          className="font-heading text-lg font-semibold text-foreground"
        >
          Search currencies
        </h2>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedCode(null);
            }}
            placeholder="Search by code or name (e.g. Naira, EUR)…"
            className="min-h-11 pl-10 text-base sm:text-sm"
            aria-label="Search currencies"
          />
        </div>

        {searchQuery.trim().length > 0 && searchResults.length > 0 && (
          <ul className="glass flex max-h-[min(12rem,40dvh)] flex-col gap-1 overflow-y-auto overscroll-y-contain rounded-xl border border-border/60 p-2 sm:max-h-48">
            {searchResults.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => setSelectedCode(c.code)}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150 sm:min-h-0 sm:py-2",
                    selectedCode === c.code
                      ? "bg-primary/15 text-foreground ring-1 ring-primary/25"
                      : "hover:bg-muted/60 text-foreground",
                  )}
                >
                  <span className="shrink-0 rounded-md bg-chart-2/15 px-2 py-0.5 font-mono text-xs font-bold tabular-nums text-chart-2">
                    {c.code}
                  </span>
                  <span className="min-w-0 truncate text-xs text-muted-foreground sm:text-sm">
                    {c.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {selectedCode && selectedMeta && !userMissingInRates && (
          <div className="glass rounded-2xl border border-border/80 p-3 shadow-sm sm:p-5">
            <p className="flex flex-wrap items-center gap-2 font-heading text-sm font-semibold text-foreground">
              <span>{selectedMeta.name}</span>
              <CurrencyBadge code={selectedCode} variant="target" />
            </p>
            <div className="mt-3 grid gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4">
              <div className="rounded-xl border border-border/50 bg-muted/25 p-3 ring-1 ring-primary/10">
                <p className="text-xs font-medium text-muted-foreground">
                  Your amount (same as top)
                </p>
                <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-1 font-mono text-sm tabular-nums sm:text-base">
                  <span className="font-semibold text-foreground">
                    {baseAmountNum != null ? formatMoney2(baseAmountNum) : "—"}
                  </span>
                  <CurrencyBadge code={user} variant="base" />
                  <span className="text-muted-foreground">=</span>
                  <span className="font-semibold text-primary">
                    {convToSelected != null ? formatMoney2(convToSelected) : "—"}
                  </span>
                  <CurrencyBadge code={selectedCode} variant="target" />
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/25 p-3 ring-1 ring-chart-2/15">
                <p className="text-xs font-medium text-muted-foreground">
                  Spot reference
                </p>
                <p className="mt-2 font-mono text-xs tabular-nums text-muted-foreground sm:text-sm">
                  <span className="text-foreground">1 {user}</span>
                  <span> = </span>
                  <span className="font-semibold text-chart-3 dark:text-chart-4">
                    {rateToSelected != null ? formatMoney2(rateToSelected) : "—"}
                  </span>
                  <span> {selectedCode}</span>
                </p>
                <p className="mt-1.5 font-mono text-xs tabular-nums text-muted-foreground sm:text-sm">
                  <span className="text-foreground">1 {selectedCode}</span>
                  <span> = </span>
                  <span className="font-semibold text-chart-3 dark:text-chart-4">
                    {rateFromSelected != null ? formatMoney2(rateFromSelected) : "—"}
                  </span>
                  <span> {user}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <p className="text-balance px-0.5 text-center text-[10px] leading-relaxed text-muted-foreground sm:text-xs">
        Indicative midpoint rates for reference only — not for trading or bank
        settlement. Finora ledger entries are not auto-converted.
      </p>
    </div>
  );
}
