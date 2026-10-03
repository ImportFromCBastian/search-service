import type { SiteResponse } from '@search-service/shared/schemas/site.schema'

import {
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Globe,
  KeyRound,
  Layers,
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchJson } from '@/lib/fetchJson'
import { trimID } from '@/lib/trimID'
import { SnapshotsTable } from './snapshots-table'
import { TriggerSnapshotButton } from './trigger-snapshot-button'
import type { SnapshotsDTO, SnapshotsPageProps } from './types'

export const metadata = {
  title: 'Snapshots — Search Service',
  description: 'Listado de snapshots del sitio.',
}

export default async function SnapshotsPage({
  params,
  searchParams,
}: SnapshotsPageProps) {
  const { id: siteId } = await params
  const resolvedSearchParams = await searchParams

  const page = Math.max(1, Number(resolvedSearchParams?.page) || 1)
  const limit = Math.max(1, Number(resolvedSearchParams?.limit) || 10)
  const status = resolvedSearchParams?.status || undefined
  const includeArchived = resolvedSearchParams?.includeArchived === 'true'
  const [siteRes, snapshotsRes] = await Promise.all([
    fetchJson<SiteResponse>(`/sites/${siteId}`, { cache: 'no-store' }),
    fetchJson<SnapshotsDTO>(`/sites/${siteId}/snapshots`, {
      params: {
        page,
        limit,
        status,
        includeArchived,
      },
      cache: 'no-store',
    }),
  ])

  if (!siteRes.success || !siteRes.data) {
    if (siteRes.status === 404) {
      notFound()
    }
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <h2 className="font-semibold text-destructive">
            Error al cargar el sitio
          </h2>
          <p className="text-xs text-muted-foreground">
            {siteRes.error?.message}
          </p>
          <Link href="/sites">
            <Button variant="outline" size="sm">
              Volver a Mis Sitios
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const site = siteRes.data
  const snapshotsData = snapshotsRes.data

  const hasActiveSnapshot = snapshotsData?.items.some(
    (s) => s.status === 'pending' || s.status === 'running'
  )

  const publishedSnapshot = snapshotsData?.items.find((s) => s.isPublished)

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/sites" className="hover:text-foreground transition-colors">
          Mis Sitios
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-foreground">{site.name}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-muted-foreground">Snapshots</span>
      </nav>

      {/* Header del Sitio */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {site.name}
              </h1>
              <Badge variant="secondary" className="capitalize text-xs">
                {site.frequency}
              </Badge>
              {publishedSnapshot ? (
                <Badge variant="success" className="gap-1 text-xs">
                  <Globe className="h-3 w-3" />
                  <span>Publicado: {trimID(publishedSnapshot._id)}</span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-muted-foreground text-xs"
                >
                  Sin snapshot publicado
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
              >
                <span>{site.url}</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                <span>Profundidad: {site.depth}</span>
              </span>

              <span className="flex items-center gap-1 font-mono">
                <KeyRound className="h-3 w-3" />
                <span>{site.apiKeyPrefix}</span>
              </span>
            </div>
          </div>

          <TriggerSnapshotButton
            siteId={siteId}
            hasActiveSnapshot={hasActiveSnapshot}
          />
        </div>
      </div>

      {/* Tabla de Snapshots */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Historial de Ejecuciones
          </h2>
          <span className="text-xs text-muted-foreground">
            {snapshotsData?.total || 0} snapshots registrados
          </span>
        </div>

        <SnapshotsTable
          siteId={siteId}
          data={snapshotsData?.items || []}
          pagination={
            snapshotsData
              ? {
                  page: snapshotsData.page,
                  limit: snapshotsData.limit,
                  total: snapshotsData.total,
                  totalPages: snapshotsData.totalPages,
                }
              : undefined
          }
          includeArchived={includeArchived}
          currentStatus={status}
        />
      </div>
    </div>
  )
}
