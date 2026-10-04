'use client'

import { ArrowLeft, TableProperties } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { densityOptions, pageSizeOptions } from '@/constraits/strings'
import {
  type DefaultPageSize,
  type Density,
  useSettingsStore,
} from '@/store/settings-store'
import { revalidateSettingsAction } from '../actions'

export default function TablePreferencesPage() {
  const router = useRouter()
  const table = useSettingsStore((state) => state.table)
  const setTable = useSettingsStore((state) => state.setTable)

  const handleUpdate = async (patch: Parameters<typeof setTable>[0]) => {
    setTable(patch)
    router.refresh()
    await revalidateSettingsAction()
  }

  return (
    <div className="container py-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/configuration"
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="sr-only">Back to Configuration</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-md text-primary">
            <TableProperties className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Table Preferences
            </h1>
            <p className="text-muted-foreground">
              Adjust how data is displayed in tables.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Table Settings</CardTitle>
          <CardDescription>
            Configure your default table experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="page-size">Default Page Size</Label>
                <p className="text-sm text-muted-foreground">
                  Number of items to show per page by default.
                </p>
              </div>
              <Select
                items={pageSizeOptions}
                value={String(table.defaultPageSize)}
                onValueChange={(val) => {
                  if (val != null) {
                    handleUpdate({
                      defaultPageSize: Number(val) as DefaultPageSize,
                    })
                  }
                }}
              >
                <SelectTrigger id="page-size" className="w-45">
                  <SelectValue placeholder="Select size">
                    {(val) =>
                      pageSizeOptions.find((o) => o.value === String(val))
                        ?.label
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="density">Density</Label>
                <p className="text-sm text-muted-foreground">
                  Adjust the spacing inside table cells.
                </p>
              </div>
              <Select
                items={densityOptions}
                value={table.density}
                onValueChange={(val) => {
                  if (val != null) {
                    handleUpdate({ density: val as Density })
                  }
                }}
              >
                <SelectTrigger id="density" className="w-45">
                  <SelectValue placeholder="Select density">
                    {(val) =>
                      densityOptions.find((o) => o.value === val)?.label
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {densityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
