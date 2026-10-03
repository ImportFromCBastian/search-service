import { Search } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Blobatar } from '@/components/ui/blobatar'
import { NavLinks } from './nav-links'

export default function NavBar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <LogoSection />
        <NavLinks />
        <UserProfileSection />
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

function UserProfileSection() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <ThemeToggle />
      <span className="hidden sm:inline font-medium text-foreground">
        sebshndz{' '}
        <span className="text-muted-foreground font-normal">(Admin)</span>
      </span>
      <Blobatar name="sebshndz2001" />
    </div>
  )
}
