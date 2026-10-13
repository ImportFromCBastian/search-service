import Link from 'next/link'
import ButtonAuth from '@/components/auth/login-button'

export default function Home() {
  return (
    <Link href="/sites" className="flex items-center justify-center">
      <ButtonAuth />
    </Link>
  )
}
