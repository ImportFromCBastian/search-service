import type { SiteResponse } from '@search-service/shared/schemas/site.schema'
import { AlertCircle, Globe, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { fetchJson } from '@/lib/fetchJson'
import { columns } from './columns'
import { DataTable } from './data-table'

interface SiteDTO {
  items: SiteResponse[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface SitesPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
  }>
}

export default async function SitesPage({ searchParams }: SitesPageProps) {
  const resolvedParams = await searchParams
  const page = Math.max(1, Number(resolvedParams?.page) || 1)
  const limit = Math.max(1, Number(resolvedParams?.limit) || 10)

  const { success, data, error } = await fetchJson<SiteDTO>('/sites', {
    params: { page, limit },
    cache: 'no-store',
  })

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Mis Sitios
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus sitios web registrados y el historial de sus snapshots
            de indexación.
          </p>
        </div>
        <Link href="/sites/new">
          <Button className="gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Nuevo Sitio</span>
          </Button>
        </Link>
      </div>

      {/* Error state */}
      {!success && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <div className="space-y-1">
            <h3 className="font-semibold text-destructive">
              Error al cargar sitios
            </h3>
            <p className="text-xs text-muted-foreground">
              {error?.message || 'No se pudo conectar con el servidor backend.'}
            </p>
          </div>
          <Link href="/sites">
            <Button variant="outline" size="sm">
              Reintentar
            </Button>
          </Link>
        </div>
      )}

      {/* Empty state */}
      {success && (!data || data.items.length === 0) && (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Globe className="h-7 w-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-semibold text-foreground">
              No tienes ningún sitio registrado
            </h3>
            <p className="text-xs text-muted-foreground">
              Comienza registrando tu primer sitio web para iniciar la
              extracción e indexación de páginas automáticamente.
            </p>
          </div>
          <Link href="/sites/new">
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Registrar primer sitio</span>
            </Button>
          </Link>
        </div>
      )}

      {/* Data Table */}
      {success && data && data.items.length > 0 && (
        <DataTable
          columns={columns}
          data={data.items}
          pagination={{
            page: data.page,
            limit: data.limit,
            total: data.total,
            totalPages: data.totalPages,
          }}
        />
      )}
    </div>
  )
}
