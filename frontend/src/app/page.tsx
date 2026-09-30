import Link from 'next/link'

export default function Home() {
  return (
    <Link
      href="/sites"
      className="flex items-center justify-center text-2xl font-bold text-blue-600 hover:underline"
    >
      To Sites
    </Link>
  )
}
