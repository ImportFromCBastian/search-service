'use client'

import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchFormProps {
  initialQuery?: string
}

export function SearchForm({ initialQuery = '' }: SearchFormProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(initialQuery)
  const currentQ = searchParams.get('q') || ''

  // Sync state if URL changes externally (e.g. browser navigation)
  useEffect(() => {
    setQuery(currentQ)
  }, [currentQ])

  // Debounced search on typing (~400ms)
  useEffect(() => {
    if (query.trim() === currentQ.trim()) {
      return
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      const trimmed = query.trim()
      if (trimmed) {
        params.set('q', trimmed)
      } else {
        params.delete('q')
      }
      params.set('page', '1')
      router.replace(`${pathname}?${params.toString()}`)
    }, 400)

    return () => clearTimeout(timer)
  }, [query, currentQ, pathname, router, searchParams])

  // Instant search on button click / form submit
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    const params = new URLSearchParams(searchParams.toString())
    const trimmed = query.trim()
    if (trimmed) {
      params.set('q', trimmed)
    } else {
      params.delete('q')
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en snapshots publicados..."
          className="pl-9 h-10 text-sm"
        />
      </div>
      <Button type="submit" className="h-10 px-5 gap-1.5 shadow-sm">
        <Search className="h-4 w-4" />
        <span>Buscar</span>
      </Button>
    </form>
  )
}
