import { Skeleton } from '@/components/ui/skeleton'

export default function SearchLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Search Input & Button Skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Results Skeleton */}
      <div className="space-y-4 pt-2">
        {['res-1', 'res-2', 'res-3', 'res-4'].map((id) => (
          <div
            key={id}
            className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm"
          >
            <div className="space-y-1">
              <Skeleton className="h-5 w-72 max-w-full" />
              <Skeleton className="h-3.5 w-36" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  )
}
