'use client'

import type { SiteResponse } from '@search-service/shared/schemas/site.schema'
import { createColumnHelper } from '@tanstack/react-table'
import { ArrowRight, ExternalLink, Layers } from 'lucide-react'
import Link from 'next/link'
import { SnapshotStatusBadge } from '@/components/snapshot-status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { DataTableFeatures } from './data-table-feature'

const columnHelper = createColumnHelper<DataTableFeatures, SiteResponse>()

export const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Sitio',
    cell: ({ row }) => {
      const site = row.original
      return (
        <div className="flex flex-col">
          <Link
            href={`/sites/${site._id}/snapshot`}
            className="font-semibold text-foreground hover:text-primary transition-colors hover:underline"
          >
            {site.name}
          </Link>
          <span className="text-xs text-muted-foreground font-mono">
            {site.apiKeyPrefix}
          </span>
        </div>
      )
    },
  }),

  columnHelper.accessor('url', {
    header: 'URL',
    cell: ({ getValue }) => {
      const url = getValue()
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors max-w-[260px] truncate"
        >
          <span className="truncate">{url}</span>
          <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      )
    },
  }),

  columnHelper.accessor('depth', {
    header: 'Profundidad',
    cell: ({ getValue }) => {
      const depth = getValue()
      return (
        <div className="flex items-center gap-1 text-xs">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Nivel {depth}</span>
        </div>
      )
    },
  }),

  columnHelper.accessor('frequency', {
    header: 'Frecuencia',
    cell: ({ getValue }) => {
      const freq = getValue()
      return (
        <Badge variant="secondary" className="capitalize text-[11px]">
          {freq}
        </Badge>
      )
    },
  }),

  columnHelper.accessor('lastSnapshot.at', {
    header: 'Último Snapshot',
    cell: ({ row }) => {
      const at = row.original.lastSnapshot?.at
      if (!at) return <span className="text-xs text-muted-foreground">—</span>

      const date = new Date(at)
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

  columnHelper.accessor('lastSnapshot.status', {
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.original.lastSnapshot?.status
      return <SnapshotStatusBadge status={status} />
    },
  }),

  columnHelper.display({
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const site = row.original
      return (
        <div className="flex items-center">
          <Link href={`/sites/${site._id}/snapshot`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <span>Snapshots</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )
    },
  }),
])
