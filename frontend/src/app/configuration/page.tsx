import {
  Accessibility,
  TableProperties,
  KeyRound,
  Database,
} from 'lucide-react'
import { ConfigCard } from './config-card'

export default function ConfigurationPage() {
  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground">
          Manage your preferences and service settings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ConfigCard
          title="Accessibility"
          description="Manage text size, contrast, motion and link styles."
          icon={<Accessibility className="w-6 h-6" />}
          href="/configuration/accessibility"
        />
        <ConfigCard
          title="Table Preferences"
          description="Adjust data density and default page sizes."
          icon={<TableProperties className="w-6 h-6" />}
          href="/configuration/table-preferences"
        />
        <ConfigCard
          title="API Keys"
          description="Manage and regenerate API keys for your sites."
          icon={<KeyRound className="w-6 h-6" />}
          href="/configuration/api-keys"
        />
        <ConfigCard
          title="Data & Usage"
          description="Manage local data stored on this device."
          icon={<Database className="w-6 h-6" />}
          href="/configuration/data-usage"
        />
      </div>
    </div>
  )
}
