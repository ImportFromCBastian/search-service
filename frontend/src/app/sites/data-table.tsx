'use client'

import { type ColumnDef, type RowData, useTable } from '@tanstack/react-table'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type DataTableFeatures, features } from './data-table-feature'
import { useSettingsStore } from '@/store/settings-store'

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
  pagination?: PaginationMeta
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  pagination,
}: DataTableProps<TData>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const density = useSettingsStore((state) => state.table.density)
  const isCompact = density === 'compact'

  const table = useTable({
    features,
    data,
    columns,
  })

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted/40 hover:bg-muted/40"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`font-semibold text-foreground/80 ${isCompact ? 'py-1.5' : 'py-3'}`}
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="transition-colors hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={isCompact ? 'py-1.5' : 'py-3.5'}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Barra de paginación server-driven */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 text-xs text-muted-foreground">
          <div>
            Mostrando página{' '}
            <span className="font-medium text-foreground">
              {pagination.page}
            </span>{' '}
            de{' '}
            <span className="font-medium text-foreground">
              {pagination.totalPages}
            </span>{' '}
            ({pagination.total} sitios en total)
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
