import type { SearchResponse } from '@search-service/shared/schemas/document.schema'
import { AlertCircle, Search } from 'lucide-react'
import { cookies } from 'next/headers'
import { fetchJson } from '@/lib/fetchJson'
import { ResultList } from './result-list'
import { SearchForm } from './search-form'

export const metadata = {
  title: 'Buscador — Search Service',
  description: 'Buscador de documentos indexados en snapshots publicados.',
}

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    page?: string
    limit?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams
  const q = resolvedParams?.q?.trim() || ''
  const page = Math.max(1, Number(resolvedParams?.page) || 1)

  const cookieStore = await cookies()
  const cookieLimit = Number(cookieStore.get('ss_page_size')?.value)
  const limit = Math.max(1, Number(resolvedParams?.limit) || cookieLimit || 10)

  let searchData: SearchResponse | null = null
  let errorMessage: string | null = null

  if (q) {
    const res = await fetchJson<SearchResponse>('/documents/search', {
      params: { q, page, limit },
      cache: 'no-store',
    })

    if (res.success && res.data) {
      searchData = res.data
    } else {
      errorMessage =
        res.error?.message || 'No se pudo conectar con el servidor de búsqueda.'
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Buscador
        </h1>
        <p className="text-sm text-muted-foreground">
          Encuentra documentos y contenido indexado en los snapshots publicados
          de tus sitios.
        </p>
      </div>

      {/* Input + Botón */}
      <SearchForm initialQuery={q} />

      {/* Estado: Sin consulta ingresada */}
      {!q && (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Search className="h-6 w-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-semibold text-foreground">
              Comienza una búsqueda
            </h3>
            <p className="text-xs text-muted-foreground">
              Escribe una frase o término clave arriba para explorar el
              contenido indexado en tus sitios web.
            </p>
          </div>
        </div>
      )}

      {/* Estado: Error en la petición */}
      {q && errorMessage && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <div className="space-y-1">
            <h3 className="font-semibold text-destructive">
              Error al realizar la búsqueda
            </h3>
            <p className="text-xs text-muted-foreground">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Estado: Búsqueda sin resultados */}
      {q && !errorMessage && searchData && searchData.items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Search className="h-6 w-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-semibold text-foreground">
              Sin resultados
            </h3>
            <p className="text-xs text-muted-foreground">
              No se encontraron documentos que coincidan con &ldquo;{q}&rdquo;.
              Intenta con otras palabras clave.
            </p>
          </div>
        </div>
      )}

      {/* Estado: Resultados encontrados */}
      {q && !errorMessage && searchData && searchData.items.length > 0 && (
        <ResultList
          items={searchData.items}
          pagination={{
            page: searchData.page,
            limit: searchData.limit,
            total: searchData.total,
            totalPages: searchData.totalPages,
          }}
        />
      )}
    </div>
  )
}
