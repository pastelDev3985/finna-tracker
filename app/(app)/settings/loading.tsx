import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-8 p-4 sm:gap-12 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
          <Skeleton className="h-48 w-full max-w-2xl rounded-2xl" />
        </div>
      ))}
    </div>
  );
}
