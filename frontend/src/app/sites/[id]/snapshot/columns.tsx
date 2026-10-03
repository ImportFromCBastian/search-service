'use client'

import type { SnapshotResponse } from '@search-service/shared/schemas/snapshot.schema'
import { createColumnHelper } from '@tanstack/react-table'
import { Archive, Ban, Clock, FileText } from 'lucide-react'
import { SnapshotStatusBadge } from '@/components/snapshot-status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { trimID } from '@/lib/trimID'
import type { DataTableFeatures } from '../../data-table-feature'
import { cancelSnapshotAction } from './actions'
import { PublishButton } from './publish-button'

const columnHelper = createColumnHelper<DataTableFeatures, SnapshotResponse>()

export const getSnapshotColumns = (siteId: string) =>
  columnHelper.columns([
    // Checkbox de selección
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
          aria-label="Seleccionar todos los snapshots"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
          aria-label="Seleccionar snapshot"
        />
      ),
    }),

    // ID / Código
    columnHelper.accessor('_id', {
      header: 'ID',
      cell: ({ getValue }) => {
        const id = getValue()
        return (
          <span className="font-mono text-xs text-muted-foreground" title={id}>
            {trimID(id)}
          </span>
        )
      },
    }),

    // Estado
    columnHelper.accessor('status', {
      header: 'Estado',
      cell: ({ getValue }) => {
        return <SnapshotStatusBadge status={getValue()} />
      },
    }),

    // Disparador
    columnHelper.accessor('trigger', {
      header: 'Origen',
      cell: ({ getValue }) => {
        const trigger = getValue()
        return (
          <span className="text-xs text-muted-foreground capitalize">
            {trigger === 'manual' ? 'Manual' : 'Programado'}
          </span>
        )
      },
    }),

    // Documentos
    columnHelper.accessor('documentCount', {
      header: 'Documentos',
      cell: ({ getValue }) => {
        const count = getValue()
        return (
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{count}</span>
          </div>
        )
      },
    }),

    // Duración
    columnHelper.accessor('durationMs', {
      header: 'Duración',
      cell: ({ getValue }) => {
        const ms = getValue()
        if (ms === undefined || ms === null)
          return <span className="text-xs text-muted-foreground">—</span>
        const seconds = (ms / 1000).toFixed(1)
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{seconds}s</span>
          </div>
        )
      },
    }),

    // Fecha
    columnHelper.accessor('createdAt', {
      header: 'Fecha',
      cell: ({ getValue }) => {
        const date = new Date(getValue())
        return (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {date.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )
      },
    }),

    // Publicación
    columnHelper.display({
      id: 'publish',
      header: 'Publicación',
      cell: ({ row }) => {
        const snapshot = row.original
        return (
          <div className="flex items-center gap-2">
            {snapshot.isArchived ? (
              <Badge
                variant="outline"
                className="gap-1 text-[10px] text-muted-foreground"
              >
                <Archive className="h-2.5 w-2.5" />
                <span>Archivado</span>
              </Badge>
            ) : (
              <PublishButton
                siteId={siteId}
                snapshotId={snapshot._id}
                isPublished={Boolean(snapshot.isPublished)}
                status={snapshot.status}
              />
            )}
          </div>
        )
      },
    }),

    // Cancelar en curso
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const snapshot = row.original
        const isActive =
          snapshot.status === 'pending' || snapshot.status === 'running'

        if (!isActive) return null

        return (
          <Button
            variant="ghost"
            size="xs"
            onClick={async () => {
              await cancelSnapshotAction(siteId, snapshot._id)
            }}
            className="text-xs text-destructive hover:bg-destructive/10 gap-1"
            title="Cancelar ejecución"
          >
            <Ban className="h-3 w-3" />
            <span>Cancelar</span>
          </Button>
        )
      },
    }),
  ])
