'use client'

import { ThemeToggle } from '../theme-toggle'
import DropdownProfile from './dropdown-profile'

export default function UserProfileSection() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <ThemeToggle />
      <span className="hidden sm:inline font-medium text-foreground">
        sebshndz{' '}
        <span className="text-muted-foreground font-normal">(Admin)</span>
      </span>
      <DropdownProfile />
    </div>
  )
}
