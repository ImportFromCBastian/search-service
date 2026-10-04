import { fetchJson } from '@/lib/fetchJson'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { RegenerateKeyDialog } from './regenerate-key-dialog'
import { SiteDTO } from '@/app/sites/dto/site.dto'

export default async function ApiKeysPage() {
  const { success, data, error } = await fetchJson<SiteDTO>('/sites', {
    params: { page: 1, limit: 100 },
    cache: 'no-store',
  })

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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-md text-primary">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
            <p className="text-muted-foreground">
              Manage authentication keys for your sites.
            </p>
          </div>
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
        <CardContent>
          {!success && (
            <div className="rounded-md bg-destructive/10 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-destructive">
                  Error loading sites
                </h4>
                <p className="text-sm text-destructive/80">{error?.message}</p>
              </div>
            </div>
          )}

          {success && data && data.items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>You haven't created any sites yet.</p>
            </div>
          )}

          {success && data && data.items.length > 0 && (
            <div className="rounded-md border">
              <div className="divide-y">
                {data.items.map((site) => (
                  <div
                    key={site._id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {site.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Prefix:{' '}
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                          {site.apiKeyPrefix}••••••••
                        </code>
                      </p>
                    </div>
                    <RegenerateKeyDialog
                      siteId={site._id}
                      siteName={site.name}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
