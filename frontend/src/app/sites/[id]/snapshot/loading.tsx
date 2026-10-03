import { Skeleton } from '@/components/ui/skeleton'

export default function SnapshotsLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      <Skeleton className="h-4 w-48" />

      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-36" />
        </div>

        <div className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-sm">
          {['snap-1', 'snap-2', 'snap-3', 'snap-4', 'snap-5', 'snap-6'].map(
            (id) => (
              <div
                key={id}
                className="flex items-center justify-between gap-4 py-2 border-b border-border/50"
              >
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-7 w-24 rounded-md" />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
