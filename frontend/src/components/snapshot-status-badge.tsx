import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SnapshotStatusBadgeProps {
  status?: string | null
}

export function SnapshotStatusBadge({ status }: SnapshotStatusBadgeProps) {
  if (!status) {
    return (
      <Badge variant="outline" className="text-muted-foreground font-normal">
        Sin snapshots
      </Badge>
    )
  }

  switch (status.toLowerCase()) {
    case 'completed':
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          <span>Completado</span>
        </Badge>
      )
    case 'running':
      return (
        <Badge variant="info" className="gap-1 animate-pulse">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>En curso</span>
        </Badge>
      )
    case 'pending':
      return (
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" />
          <span>Pendiente</span>
        </Badge>
      )
    case 'failed':
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          <span>Fallido</span>
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
