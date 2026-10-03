'use client'

import { Globe, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { publishSnapshotAction, unpublishSnapshotAction } from './actions'

interface PublishButtonProps {
  siteId: string
  snapshotId: string
  isPublished: boolean
  status: string
}

export function PublishButton({
  siteId,
  snapshotId,
  isPublished,
  status,
}: PublishButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      if (isPublished) {
        await unpublishSnapshotAction(siteId, snapshotId)
      } else {
        await publishSnapshotAction(siteId, snapshotId)
      }
    } finally {
      setLoading(false)
    }
  }

  if (isPublished) {
    return (
      <div className="flex items-center gap-1.5">
        <Badge variant="success" className="gap-1 text-[11px] font-semibold">
          <Globe className="h-3 w-3" />
          <span>Publicado</span>
        </Badge>
        <Button
          variant="ghost"
          size="xs"
          onClick={handleToggle}
          disabled={loading}
          className="text-xs text-muted-foreground hover:text-destructive"
          title="Despublicar este snapshot"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            'Despublicar'
          )}
        </Button>
      </div>
    )
  }

  // Solo se puede publicar si está completado
  if (status !== 'completed') {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <Button
      variant="outline"
      size="xs"
      onClick={handleToggle}
      disabled={loading}
      className="gap-1 text-xs hover:border-primary hover:text-primary"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Globe className="h-3 w-3" />
      )}
      <span>Publicar</span>
    </Button>
  )
}
