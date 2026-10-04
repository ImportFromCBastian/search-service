'use client'

import { Check, Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { regenerateApiKeyAction } from '../actions'

interface RegenerateKeyDialogProps {
  siteId: string
  siteName: string
}

export function RegenerateKeyDialog({
  siteId,
  siteName,
}: RegenerateKeyDialogProps) {
  const [loading, setLoading] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleRegenerate = async () => {
    setLoading(true)
    try {
      const result = await regenerateApiKeyAction(siteId)
      if (result.success && result.data) {
        setNewKey(result.data.apiKey)
      } else {
        console.error(result.error)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (newKey) {
      await navigator.clipboard.writeText(newKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && newKey) {
      // Si cierra el dialog después de regenerar, limpiamos la key
      setNewKey(null)
    }
    setIsOpen(open)
  }

  if (newKey) {
    return (
      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nueva API Key Generada</AlertDialogTitle>
            <AlertDialogDescription>
              Copia esta clave ahora. Por seguridad, no podrás volver a verla.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2 my-4">
            <Input value={newKey} readOnly className="font-mono text-sm" />
            <Button
              size="icon"
              onClick={copyToClipboard}
              variant="outline"
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-3 h-3" />
          Regenerar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Regenerar API Key para {siteName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción invalidará la API Key actual inmediatamente. Cualquier
            aplicación que la esté usando dejará de funcionar hasta que sea
            actualizada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleRegenerate}
            disabled={loading}
          >
            {loading ? 'Regenerando...' : 'Sí, regenerar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
