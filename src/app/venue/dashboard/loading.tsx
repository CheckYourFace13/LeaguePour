import { Skeleton } from "@/components/ui/skeleton";

export default function VenueDashboardLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
