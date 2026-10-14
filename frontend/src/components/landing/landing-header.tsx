'use client'

import { ArrowRight, LogIn, Search } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { href: '#caracteristicas', label: 'Características' },
  { href: '#arquitectura', label: 'Arquitectura' },
  { href: '#faq', label: 'FAQ' },
]

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight
      const progress = docHeight > 0 ? (currentScroll / docHeight) * 100 : 0
      setScrollProgress(progress)
      setScrolled(currentScroll > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Barra de progreso de lectura superior */}
      <div
        className="fixed top-0 left-0 h-0.75 bg-linear-to-r from-primary to-accent z-50 transition-all duration-75 shadow-[0_0_10px_var(--accent)]"
        style={{ width: `${scrollProgress}%` }}
      />

      <header
        className={`sticky top-0 z-40 w-full backdrop-blur-md transition-all duration-300 border-b ${
          scrolled
            ? 'bg-background/90 border-border shadow-sm'
            : 'bg-background/70 border-border/60'
        }`}
      >
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo Marca */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-lg text-foreground transition-opacity hover:opacity-90"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Search className="h-4 w-4 stroke-[2.5]" />
            </span>
            <span>Search Service</span>
          </Link>

          {/* Enlaces de Navegación Suave */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Acciones y Auth0 */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {/* Iniciar Sesión con Auth0 */}
            <Link href="/auth/login">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 font-semibold cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </Button>
            </Link>

            {/* Registro con Auth0 */}
            <Link href="/auth/login?screen_hint=signup">
              <Button
                size="sm"
                className="btn-shimmer gap-1.5 shadow-sm font-semibold cursor-pointer"
              >
                <span>Registrarse</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}
