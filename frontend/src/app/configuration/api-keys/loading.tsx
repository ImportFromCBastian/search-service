import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ApiKeysLoading() {
  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/configuration"
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="sr-only">Back to Configuration</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage authentication keys for your sites.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Site API Keys</CardTitle>
          <CardDescription>
            These keys are required to interact with the search service API for
            each specific site.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  )
}
