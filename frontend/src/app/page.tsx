import { redirect } from 'next/navigation'
import { LandingPage } from '@/components/landing/landing-page'
import { auth0 } from '@/lib/auth0'

export const metadata = {
  title:
    'Search Service — Plataforma Empresarial de Crawling y Búsqueda Full-Text',
  description:
    'Infraestructura de crawling web inteligente, extracción estructurada de contenido, snapshots inmutables y API de búsqueda full-text de latencia ultrabaja para aplicaciones empresariales.',
}

export default async function Home() {
  const session = await auth0.getSession()

  // Si el usuario ya está autenticado, redirigir a sus sitios
  if (session) {
    redirect('/sites')
  }

  // Si no está autenticado, mostrar la landing page corporativa
  return <LandingPage />
}
