'use client'

import { AlertCircle, Loader2, Play } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { triggerSnapshotAction } from './actions'

interface TriggerSnapshotButtonProps {
  siteId: string
  hasActiveSnapshot?: boolean
}

export function TriggerSnapshotButton({
  siteId,
  hasActiveSnapshot,
}: TriggerSnapshotButtonProps) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleTrigger = async () => {
    setErrorMsg(null)
    setLoading(true)
    try {
      const res = await triggerSnapshotAction(siteId)
      if (!res.success) {
        setErrorMsg(res.error || 'No se pudo iniciar el snapshot')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handleTrigger}
        disabled={loading || hasActiveSnapshot}
        className="gap-1.5 shadow-sm"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4 fill-current" />
        )}
        <span>
          {hasActiveSnapshot ? 'Snapshot en curso' : 'Ejecutar Snapshot'}
        </span>
      </Button>
      {errorMsg && (
        <span className="flex items-center gap-1 text-[11px] text-destructive">
          <AlertCircle className="h-3 w-3" />
          {errorMsg}
        </span>
      )}
    </div>
  )
}
