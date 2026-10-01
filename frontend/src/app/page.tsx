import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <Link href="/sites" className="flex items-center justify-center">
      <Button>To Sites</Button>
    </Link>
  )
}
