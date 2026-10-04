'use client'

import type { SearchResult } from '@search-service/shared/schemas/document.schema'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ResultCard } from './result-card'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ResultListProps {
  items: SearchResult[]
  pagination?: PaginationMeta
}

export function ResultList({ items, pagination }: ResultListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {items.map((item) => (
          <ResultCard key={item._id} item={item} />
        ))}
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 text-xs text-muted-foreground">
          <div>
            Página{' '}
            <span className="font-medium text-foreground">
              {pagination.page}
            </span>{' '}
            de{' '}
            <span className="font-medium text-foreground">
              {pagination.totalPages}
            </span>{' '}
            ({pagination.total} resultados encontrados)
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => goToPage(1)}
              disabled={pagination.page <= 1}
              title="Primera página"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Anterior</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="gap-1"
            >
              <span>Siguiente</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => goToPage(pagination.totalPages)}
              disabled={pagination.page >= pagination.totalPages}
              title="Última página"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
