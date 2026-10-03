'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navBarStrings } from '@/constraits/strings'

export function NavLinks() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-6">
      {navBarStrings.map((item) => {
        const isActive =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative py-1 text-sm transition-colors hover:text-primary ${
              isActive
                ? 'font-semibold text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full'
                : 'text-muted-foreground'
            }`}
          >
            {item.title}
          </Link>
        )
      })}
    </div>
  )
}
