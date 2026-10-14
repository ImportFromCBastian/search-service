'use client'

import { ArrowRight, Play, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const [latencyVal, setLatencyVal] = useState(0)
  const [slaVal, setSlaVal] = useState(0)
  const [immutabilityVal, setImmutabilityVal] = useState(0)
  const metricsRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = metricsRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !startedRef.current) {
          startedRef.current = true
          const duration = 1600
          const start = performance.now()

          const frame = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const ease = 1 - (1 - progress) ** 4

            setLatencyVal(Math.round(18 * ease))
            setSlaVal(Number((99.99 * ease).toFixed(2)))
            setImmutabilityVal(Math.round(100 * ease))

            if (progress < 1) {
              requestAnimationFrame(frame)
            } else {
              setLatencyVal(18)
              setSlaVal(99.99)
              setImmutabilityVal(100)
            }
          }

          requestAnimationFrame(frame)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const metrics = [
    { value: `< ${latencyVal}ms`, label: 'Latencia de Búsqueda' },
    { value: `${slaVal}%`, label: 'SLA de Disponibilidad' },
    { value: `${immutabilityVal}%`, label: 'Inmutabilidad Snapshots' },
    { value: 'TLS 1.3', label: 'Cifrado AES-256' },
  ]

  return (
    <section className="relative overflow-hidden hero-glow-bg pt-16 pb-12 sm:pt-20 sm:pb-16 text-center">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        {/* Radar Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/40 bg-secondary/80 text-secondary-foreground text-xs sm:text-sm font-semibold mb-6 shadow-xs backdrop-blur-xs">
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="animate-radar-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>
            Red distribuida de Crawling & Full-Text Search v2.4 activa
          </span>
        </div>

        {/* Título Principal */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12] mb-6">
          Crawling web inteligente y búsqueda instantánea para{' '}
          <span className="text-primary bg-linear-to-r from-primary via-primary-light to-sky-400 bg-clip-text">
            empresas de alta escala
          </span>
        </h1>

        {/* Subtítulo enfocado en valor de usuario */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          Indexa y centraliza el contenido de tus sitios web de forma
          automatizada, programa rastreos periódicos sin saturar tus servidores
          y consulta millones de documentos con{' '}
          <strong className="text-foreground font-semibold">
            latencia sub-20ms
          </strong>{' '}
          mediante una API de búsqueda ultrarrápida y segura.
        </p>

        {/* Botones CTA Principales */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link href="/auth/login?screen_hint=signup">
            <Button
              size="lg"
              className="btn-shimmer h-12 px-7 text-base font-semibold gap-2 shadow-lg shadow-primary/25"
            >
              <UserPlus className="h-5 w-5" />
              <span>Comenzar con Search Service — Gratis</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <a href="#demo">
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-7 text-base font-semibold gap-2 border-border hover:bg-secondary/60"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Explorar Consola Interactiva</span>
            </Button>
          </a>
        </div>

        {/* Métricas de Rendimiento Renderizadas Declarativamente */}
        <div
          ref={metricsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-border"
        >
          {metrics.map((m) => (
            <div key={m.label} className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {m.value}
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
