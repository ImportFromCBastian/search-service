'use client'

import { useState, useEffect } from 'react'
import { useSettingsStore, applyAccessibilityToDOM } from '@/store/settings-store'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2, Database } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { revalidateSettingsAction } from '../actions'

export default function DataUsagePage() {
  const router = useRouter()
  const resetAll = useSettingsStore((state) => state.resetAll)
  const [dataSize, setDataSize] = useState<number>(0)

  useEffect(() => {
    // Calcular tamaño en localStorage
    let size = 0
    if (typeof window !== 'undefined') {
      const settings = localStorage.getItem('search-service-settings')
      if (settings) {
        size = new Blob([settings]).size
      }
    }
    setDataSize(size)
  }, [])

  const handleReset = async () => {
    resetAll()
    // Limpiar las cookies
    if (typeof document !== 'undefined') {
      document.cookie = 'ss_page_size=; path=/; max-age=0'
      document.cookie = 'ss_density=; path=/; max-age=0'
    }
    applyAccessibilityToDOM({
      fontScale: 1,
      highContrast: false,
      reduceMotion: false,
      underlineLinks: false,
    })
    setDataSize(0)
    router.refresh()
    await revalidateSettingsAction()
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data & Usage</h1>
            <p className="text-muted-foreground">
              Manage data stored on this device.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Local Storage</CardTitle>
          <CardDescription>
            This application stores some data locally in your browser to
            remember your preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Settings Data</span>
            <span className="text-muted-foreground">
              {formatBytes(dataSize)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            This data includes your accessibility settings, table preferences,
            and other UI state. It is stored locally and never sent to our
            servers, except for necessary functional cookies.
          </p>
        </CardContent>
        <CardFooter className="bg-muted/50 flex justify-between items-center py-4">
          <span className="text-sm font-medium">
            Reset all local preferences
          </span>
          <Button variant="destructive" onClick={handleReset} className="gap-2">
            <Trash2 className="w-4 h-4" />
            Clear Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
