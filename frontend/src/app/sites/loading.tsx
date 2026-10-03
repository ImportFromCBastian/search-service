import { Skeleton } from '@/components/ui/skeleton'

export default function SitesLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={`site-skel-${item}`}
              className="flex items-center justify-between gap-4 py-2 border-b border-border/50"
            >
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
