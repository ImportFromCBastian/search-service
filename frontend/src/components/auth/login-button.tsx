'use client'

import { useActiveNavbarStore } from '@/store/activeNavbar'
import { Button } from '@/components/ui/button'

export default function ButtonAuth() {
  const { setActiveNavbar } = useActiveNavbarStore()

  return <Button onClick={() => setActiveNavbar(true)}>Login</Button>
}
