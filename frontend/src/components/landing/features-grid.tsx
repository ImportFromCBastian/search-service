'use client'

import {
  CalendarClock,
  Clock,
  FileText,
  Lock,
  Network,
  Zap,
} from 'lucide-react'
import type React from 'react'
import { Badge } from '@/components/ui/badge'

const FEATURES = [
  {
    icon: FileText,
    title: 'Extracción Inteligente de Contenido',
    description:
      'Captura con precisión títulos, resúmenes, autores y metadatos estructurados de cada página web mediante selectores y reglas visuales flexibles.',
  },
  {
    icon: Clock,
    title: 'Snapshots Versionados e Inmutables',
    description:
      'Historial auditable. Cada rastreo genera un snapshot inalterable con métricas de tiempo, cantidad de páginas indexadas y opción de reversión inmediata.',
  },
  {
    icon: Zap,
    title: 'Búsqueda Instantánea con Snippets',
    description:
      'Respuestas sub-20ms con fragmentos contextuales (previo, coincidencia y posterior) listos para renderizar resaltados precisos en tu interfaz.',
  },
  {
    icon: Lock,
    title: 'Seguridad Empresarial & API Keys',
    description:
      'Protección de sesiones con Auth0 SSO y MFA. Claves de acceso protegidas mediante cifrado criptográfico unidireccional y permisos por sitio.',
  },
  {
    icon: CalendarClock,
    title: 'Automatización de Rastreos & Cron',
    description:
      'Programa rastreos automáticos con periodicidad diaria, semanal o mensual, con políticas de reintento inteligente y monitoreo de fallos.',
  },
  {
    icon: Network,
    title: 'Navegación y Filtrado Inteligente',
    description:
      'Define con exactitud qué secciones de tu sitio rastrear y cuáles omitir para optimizar el tiempo de indexación y evitar páginas irrelevantes o duplicadas.',
  },
]

export function FeaturesGrid() {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <section
      id="caracteristicas"
      className="py-20 bg-muted/30 border-t border-border"
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Encabezado */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge
            variant="outline"
            className="mb-3 px-3 py-1 font-semibold border-primary/30 text-primary bg-secondary/50"
          >
            Fiabilidad & Escalabilidad
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
            Arquitectura diseñada para cargas críticas
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Cada componente está concebido para asegurar que tu búsqueda
            responda con máxima velocidad y cero downtime.
          </p>
        </div>

        {/* Grid de 6 Tarjetas con Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon
            return (
              <section
                key={feat.title}
                aria-label={feat.title}
                onMouseMove={handleMouseMove}
                className="spotlight-card rounded-2xl border border-border bg-card p-7 shadow-xs hover:shadow-md transition-all"
              >
                <div className="h-12 w-12 rounded-xl bg-secondary text-primary flex items-center justify-center mb-5 shadow-xs">
                  <Icon className="h-6 w-6 stroke-2" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </section>
            )
          })}
        </div>
      </div>
    </section>
  )
}
