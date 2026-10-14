import { Search } from 'lucide-react'
import Link from 'next/link'
import { auth0 } from '@/lib/auth0'
import UserProfileSection from '../profile/user-profile-section'
import { NavLinks } from './nav-links'

export default async function NavBar() {
  const session = await auth0.getSession()

  if (!session) {
    return null
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <LogoSection />
        <NavLinks />
        <UserProfileSection user={session.user} />
      </div>
    </header>
  )
}

function LogoSection() {
  return (
    <div className="flex items-center">
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-bold text-foreground transition-opacity hover:opacity-85"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Search className="h-4 w-4" />
        </span>
        <span>Search Service</span>
      </Link>
    </div>
  )
}
