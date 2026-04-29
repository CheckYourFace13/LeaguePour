import { Skeleton } from "@/components/ui/skeleton";

/** Applies while any `/player/*` route segment loads (navigation + suspense). */
export default function PlayerSegmentLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-28 rounded-[10px]" />
        <Skeleton className="h-10 w-3/4 max-w-md rounded-[10px]" />
        <Skeleton className="h-5 w-full max-w-lg rounded-[10px]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-36 w-full rounded-[10px]" />
        <Skeleton className="h-36 w-full rounded-[10px]" />
      </div>
      <Skeleton className="h-40 w-full rounded-[10px]" />
    </div>
  );
}
