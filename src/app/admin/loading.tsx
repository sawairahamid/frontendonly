import { CardSkeleton, Skeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";

export default function AdminLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-3 w-96" />

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-line bg-panel">
        <div className="border-b border-line px-4 py-3">
          <Skeleton className="h-3 w-40" />
        </div>
        <TableSkeleton rows={6} />
      </div>
    </div>
  );
}
