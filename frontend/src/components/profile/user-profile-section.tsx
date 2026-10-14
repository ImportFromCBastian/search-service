'use client'

import { ThemeToggle } from '../theme-toggle'
import DropdownProfile from './dropdown-profile'
import type { UserProps } from './user-props'

export default function UserProfileSection({ user }: UserProps) {
  const displayName = user?.nickname || user?.name || user?.email || 'user'

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <ThemeToggle />
      <span className="hidden sm:inline font-medium text-foreground">
        {displayName}{' '}
        <span className="text-muted-foreground font-normal">(Admin)</span>
      </span>
      <DropdownProfile user={user} />
    </div>
  )
}
