import type { SearchResult } from '@search-service/shared/schemas/document.schema'
import { ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface ResultCardProps {
  item: SearchResult
}

export function ResultCard({ item }: ResultCardProps) {
  const { name, url, siteName, snippet } = item

  return (
    <Card className="p-4 space-y-2 hover:border-primary/50 transition-colors">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
          >
            <span>{name}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
          </a>
        </div>
        <div className="text-xs text-muted-foreground">
          — sitio:{' '}
          <span className="font-medium text-foreground">{siteName}</span>
        </div>
      </div>

      {snippet && (
        <p className="text-sm text-muted-foreground leading-relaxed wrap-break-word">
          {snippet.before}
          <strong className="font-semibold text-foreground bg-primary/10 px-0.5 rounded">
            {snippet.match}
          </strong>
          {snippet.after}
        </p>
      )}
    </Card>
  )
}
