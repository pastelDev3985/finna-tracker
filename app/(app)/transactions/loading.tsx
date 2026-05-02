import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-wrap gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-lg" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="space-y-2 border rounded-lg p-4">
        {/* Header row */}
        <div className="flex gap-4 pb-4 border-b">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="flex-1 h-4" />
          ))}
        </div>
        {/* Data rows */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-4 py-4">
            {[...Array(5)].map((_, j) => (
              <Skeleton key={j} className="flex-1 h-4" />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
