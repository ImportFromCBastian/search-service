'use client'

import { Button } from '@/components/ui/button'
import { Blobatar } from 'blobatar/react'
import { LogOutIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useActiveNavbarStore } from '@/store/activeNavbar'
import { redirect, RedirectType } from 'next/navigation'

export default function DropdownProfile() {
  const { setActiveNavbar } = useActiveNavbarStore()

  const handleLogout = async (): Promise<void> => {
    setActiveNavbar(false)
    redirect('/', RedirectType.replace)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full">
            <Blobatar name="sebshndz2001" />
          </Button>
        }
      />
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={handleLogout}
            className="cursor-pointer"
          >
            <LogOutIcon />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
