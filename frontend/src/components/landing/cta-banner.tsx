import { ArrowRight, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CtaBanner() {
  return (
    <section
      aria-labelledby="cta-banner-heading"
      className="py-20 bg-background border-t border-border"
    >
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <div className="cta-banner-card relative rounded-3xl bg-linear-to-br from-[#0f2334] via-[#16334a] to-[#0a1824] border border-sky-400/30 p-10 sm:p-16 text-center shadow-2xl overflow-hidden">
          {/* Resplandor decorativo interno suave */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-1/2 left-1/2 -translate-x-1/2 h-125 w-125 rounded-full bg-sky-500/15 blur-3xl"
          />

          <h2
            id="cta-banner-heading"
            className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4"
          >
            Lleva la búsqueda de tu plataforma al estándar empresarial
          </h2>

          <p className="relative z-10 text-base sm:text-lg text-slate-100 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Únete a la infraestructura de indexación y búsqueda que combina
            control de parseo, snapshots inmutables y latencia sub-20ms.
          </p>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth/login?screen_hint=signup">
              <Button
                size="lg"
                className="h-12 px-7 text-base font-bold gap-2 bg-white text-slate-950 hover:bg-slate-100 border border-white shadow-xl focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2334] cursor-pointer"
              >
                <UserPlus className="h-5 w-5" aria-hidden="true" />
                <span>Crear cuenta gratuita</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>

            <Link href="/auth/login">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-7 text-base font-semibold border-2 border-white/80 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-xs shadow-md focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2334] cursor-pointer"
              >
                <span>Ya tengo cuenta · Iniciar sesión</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
