import { Skeleton } from "@/components/ui/skeleton";

/** Applies while any `/venue/*` route segment loads (navigation + suspense). */
export default function VenueSegmentLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32 rounded-[10px]" />
        <Skeleton className="h-10 w-2/3 max-w-md rounded-[10px]" />
        <Skeleton className="h-5 w-full max-w-lg rounded-[10px]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-32 w-full rounded-[10px]" />
        <Skeleton className="h-32 w-full rounded-[10px]" />
        <Skeleton className="h-32 w-full rounded-[10px]" />
      </div>
      <Skeleton className="h-48 w-full rounded-[10px]" />
    </div>
  );
}
