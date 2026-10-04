'use client'

import type { SnapshotResponse } from '@search-service/shared/schemas/snapshot.schema'
import { type RowSelectionState, useTable } from '@tanstack/react-table'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { snapshotStatusOptions } from '@/constraits/strings'
import { useSettingsStore } from '@/store/settings-store'
import { features } from '../../data-table-feature'
import { getSnapshotColumns } from './columns'
import { SnapshotActionsBar } from './snapshot-actions-bar'

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface SnapshotsTableProps {
  siteId: string
  data: SnapshotResponse[]
  pagination?: PaginationMeta
  includeArchived?: boolean
  currentStatus?: string
}

export function SnapshotsTable({
  siteId,
  data,
  pagination,
  includeArchived = false,
  currentStatus,
}: SnapshotsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const density = useSettingsStore((state) => state.table.density)
  const isCompact = density === 'compact'

  const columns = useMemo(() => getSnapshotColumns(siteId), [siteId])

  const table = useTable({
    features,
    data,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row._id,
  })

  // Obtener IDs de las filas seleccionadas
  const selectedIds = useMemo(() => {
    return Object.keys(rowSelection).filter((key) => rowSelection[key])
  }, [rowSelection])

  const updateParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1') // reset page on filter change
    router.push(`${pathname}?${params.toString()}`)
  }

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">Filtros:</span>
          <select
            value={currentStatus || 'all'}
            onChange={(e) =>
              updateParam(
                'status',
                e.target.value === 'all' ? undefined : e.target.value
              )
            }
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {snapshotStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) =>
              updateParam('includeArchived', e.target.checked ? 'true' : '')
            }
            className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary accent-primary"
          />
          <span>Mostrar archivados</span>
        </label>
      </div>

      {/* Barra de Acciones en Lote cuando hay selección */}
      <SnapshotActionsBar
        siteId={siteId}
        selectedIds={selectedIds}
        onActionComplete={() => setRowSelection({})}
      />

      {/* Tabla */}
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
                      className={isCompact ? 'py-1.5' : 'py-3'}
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
                  No se encontraron snapshots con los filtros seleccionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
            ({pagination.total} snapshots registrados)
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
