import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { SiteForm } from './site-form'

export const metadata = {
  title: 'Nuevo Sitio — Search Service',
  description: 'Registrar un nuevo sitio web para rastreo e indexación.',
}

export default function NewSitePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/sites" className="hover:text-foreground transition-colors">
          Mis Sitios
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-foreground">Nuevo Sitio</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Registrar nuevo sitio
        </h1>
        <p className="text-sm text-muted-foreground">
          Configura los parámetros del crawler y la función de extracción
          Cheerio.
        </p>
      </div>

      <SiteForm />
    </div>
  )
}
