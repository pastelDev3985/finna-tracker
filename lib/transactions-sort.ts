export const TRANSACTION_SORT_OPTIONS = [
  { value: "date_desc", label: "Date · newest first" },
  { value: "date_asc", label: "Date · oldest first" },
  { value: "category_asc", label: "Category · A to Z" },
  { value: "category_desc", label: "Category · Z to A" },
] as const;

export type TransactionSortValue = (typeof TRANSACTION_SORT_OPTIONS)[number]["value"];

const SORT_VALUES: readonly TransactionSortValue[] = [
  "date_desc",
  "date_asc",
  "category_asc",
  "category_desc",
];

export function parseTransactionSort(
  raw: string | undefined,
): TransactionSortValue {
  if (raw && SORT_VALUES.includes(raw as TransactionSortValue)) {
    return raw as TransactionSortValue;
  }
  return "date_desc";
}

/** Build `/transactions` URL preserving sort and page. */
export function transactionsListHref(
  page: number,
  sort: TransactionSortValue,
): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (sort !== "date_desc") params.set("sort", sort);
  const q = params.toString();
  return q ? `/transactions?${q}` : "/transactions";
}
