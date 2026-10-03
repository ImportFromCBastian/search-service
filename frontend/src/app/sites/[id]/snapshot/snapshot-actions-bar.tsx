'use client'

import type { BatchAction } from '@search-service/shared/enums/crawl.enum'
import { Archive, ArchiveRestore, Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import DeleteDialog from '@/components/delete-dialog'
import { Button } from '@/components/ui/button'
import { batchSnapshotAction } from './actions'

interface SnapshotActionsBarProps {
  siteId: string
  selectedIds: string[]
  onActionComplete?: () => void
}

export function SnapshotActionsBar({
  siteId,
  selectedIds,
  onActionComplete,
}: SnapshotActionsBarProps) {
  const [loadingAction, setLoadingAction] = useState<BatchAction | null>(null)

  if (selectedIds.length === 0) return null

  const handleAction = async (action: BatchAction) => {
    setLoadingAction(action)
    try {
      await batchSnapshotAction(siteId, selectedIds, action)
      onActionComplete?.()
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-secondary/80 px-4 py-2.5 text-xs shadow-sm backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
          {selectedIds.length}
        </span>
        <span className="font-medium text-foreground">
          {selectedIds.length === 1
            ? '1 snapshot seleccionado'
            : `${selectedIds.length} snapshots seleccionados`}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={loadingAction !== null}
          onClick={() => handleAction('archive')}
          className="gap-1.5 text-xs bg-background hover:bg-muted"
        >
          {loadingAction === 'archive' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Archive className="h-3.5 w-3.5" />
          )}
          <span>Archivar</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={loadingAction !== null}
          onClick={() => handleAction('unarchive')}
          className="gap-1.5 text-xs bg-background hover:bg-muted"
        >
          {loadingAction === 'unarchive' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ArchiveRestore className="h-3.5 w-3.5" />
          )}
          <span>Desarchivar</span>
        </Button>

        <DeleteDialog
          entityName="snapshot"
          disabled={loadingAction !== null}
          onDelete={() => handleAction('delete')}
          className="gap-1.5 text-xs"
        >
          {loadingAction === 'delete' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          <span>Eliminar</span>
        </DeleteDialog>
      </div>
    </div>
  )
}
