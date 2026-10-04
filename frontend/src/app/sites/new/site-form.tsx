'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  type CreateSiteInput,
  CreateSiteSchema,
  type SiteCreatedResponse,
} from '@search-service/shared/schemas/site.schema'
import {
  AlertCircle,
  ArrowRight,
  Check,
  Copy,
  KeyRound,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import RequiredLabel from '@/components/ui/required-label'
import { Textarea } from '@/components/ui/textarea'
import { frequencyOptions } from '@/constraits/strings'
import { createSiteAction } from '../actions'

const DEFAULT_EXTRACTOR = `($) => ({
  name: $('title').text().trim(),
  url: $('meta[property="og:url"]').attr('content'),
  description: $('meta[name="description"]').attr('content')?.trim(),
  extra: {}
})`

const DEFAULT_PAGE_RESOLVER = `(links, currentUrl) => links.filter(l => l.startsWith(currentUrl))`

export function SiteForm() {
  const [createdSite, setCreatedSite] = useState<SiteCreatedResponse | null>(
    null
  )
  const [copied, setCopied] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateSiteInput>({
    // biome-ignore lint/suspicious/noExplicitAny: true
    resolver: zodResolver(CreateSiteSchema) as any,
    defaultValues: {
      name: '',
      url: '',
      depth: 2,
      frequency: 'daily',
      extractor: DEFAULT_EXTRACTOR,
      pageResolver: DEFAULT_PAGE_RESOLVER,
    },
  })

  const onSubmit = async (values: CreateSiteInput) => {
    setSubmitError(null)
    const result = await createSiteAction(values)

    if (result.success && result.data) {
      setCreatedSite(result.data)
    } else {
      setSubmitError(result.error || 'Ocurrió un error al registrar el sitio.')
    }
  }

  const copyToClipboard = () => {
    if (createdSite?.apiKey) {
      navigator.clipboard.writeText(createdSite.apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Si ya se creó el sitio, mostrar pantalla de éxito con la API Key secreta única
  if (createdSite) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              ¡Sitio registrado exitosamente!
            </h2>
            <p className="text-xs text-muted-foreground">
              El crawler ha sido encolado para procesar el primer snapshot
              automáticamente.
            </p>
          </div>
        </div>

        {/* Banner de API Key secreta */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
            <KeyRound className="h-4 w-4 shrink-0" />
            <span>API Key secreta del sitio (¡Guárdala ahora!)</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Por seguridad, esta clave en texto plano se muestra{' '}
            <strong>únicamente en este momento</strong>. Utilízala en el header{' '}
            <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">
              x-api-key
            </code>{' '}
            para consultar la API pública de búsqueda.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md bg-background px-3 py-2 text-xs font-mono text-foreground border border-border overflow-x-auto">
              {createdSite.apiKey}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Copiada</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href={`/sites/${createdSite._id}/snapshot`}
            className="w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto gap-1.5">
              <span>Ver snapshot inicial</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/sites" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              Volver al listado de sitios
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Nombre y URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre del sitio <RequiredLabel />
            </Label>
            <Input
              id="name"
              placeholder="ej. Blog Corporativo"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">
              URL raíz <RequiredLabel />
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="https://ejemplo.com"
              {...register('url')}
            />
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url.message}</p>
            )}
          </div>
        </div>

        {/* Profundidad y Frecuencia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="depth">
              Profundidad de rastreo (1 a 10) <RequiredLabel />
            </Label>
            <Input
              id="depth"
              type="number"
              min={1}
              max={10}
              {...register('depth', { valueAsNumber: true })}
            />
            <p className="text-[11px] text-muted-foreground">
              1 = solo página inicial. Niveles superiores siguen enlaces
              salientes.
            </p>
            {errors.depth && (
              <p className="text-xs text-destructive">{errors.depth.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">
              Frecuencia de crawling <RequiredLabel />
            </Label>
            <select
              id="frequency"
              {...register('frequency')}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
            >
              {frequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.frequency && (
              <p className="text-xs text-destructive">
                {errors.frequency.message}
              </p>
            )}
          </div>
        </div>

        {/* Extractor de contenido */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="extractor">
              Función de extracción{' '}
              <a
                className="underline"
                href="https://cheerio.js.org/docs/intro/"
              >
                (Cheerio)
              </a>
              <RequiredLabel />
            </Label>
            <span className="text-[11px] text-muted-foreground font-mono">
              ($, url) =&gt; (&#123; name, description, extra &#125;)
            </span>
          </div>
          <Textarea
            id="extractor"
            rows={6}
            className="font-mono text-xs leading-relaxed"
            placeholder={DEFAULT_EXTRACTOR}
            {...register('extractor')}
          />
          <p className="text-[11px] text-muted-foreground">
            Función JavaScript aislada evaluada por cada página rastreada para
            obtener los campos del documento.
          </p>
          {errors.extractor && (
            <p className="text-xs text-destructive">
              {errors.extractor.message}
            </p>
          )}
        </div>

        {/* Page Resolver (opcional) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="pageResolver">
              Filtro de URLs opcional (Page Resolver)
            </Label>
            <span className="text-[11px] text-muted-foreground font-mono">
              (links, currentUrl) =&gt; string[]
            </span>
          </div>
          <Textarea
            id="pageResolver"
            rows={4}
            className="font-mono text-xs leading-relaxed"
            placeholder={DEFAULT_PAGE_RESOLVER}
            {...register('pageResolver')}
          />
          <p className="text-[11px] text-muted-foreground">
            Opcional. Retorna un arreglo con los enlaces a seguir por el
            crawler.
          </p>
          {errors.pageResolver && (
            <p className="text-xs text-destructive">
              {errors.pageResolver.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link href="/sites">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isSubmitting ? 'Registrando...' : 'Registrar sitio'}</span>
          </Button>
        </div>
      </div>
    </form>
  )
}
