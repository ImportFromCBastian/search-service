'use client'

import { Accessibility, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { fontScaleOptions } from '@/constraits/strings'
import { type FontScaleValue, useSettingsStore } from '@/store/settings-store'
import { revalidateSettingsAction } from '../actions'

export default function AccessibilityPage() {
  const router = useRouter()
  const accessibility = useSettingsStore((state) => state.accessibility)
  const setAccessibility = useSettingsStore((state) => state.setAccessibility)

  const handleUpdate = async (
    patch: Parameters<typeof setAccessibility>[0]
  ) => {
    setAccessibility(patch)
    router.refresh()
    await revalidateSettingsAction()
  }

  return (
    <div className="container py-8 max-w-2xl mx-auto space-y-6">
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
            <Accessibility className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accessibility</h1>
            <p className="text-muted-foreground">
              Manage your viewing preferences.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>Adjust how the application looks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="font-scale">Text Size</Label>
                <p className="text-sm text-muted-foreground">
                  Increase the font size of the application.
                </p>
              </div>
              <Select
                items={fontScaleOptions}
                value={String(accessibility.fontScale)}
                onValueChange={(val) => {
                  if (val != null) {
                    handleUpdate({ fontScale: Number(val) as FontScaleValue })
                  }
                }}
              >
                <SelectTrigger id="font-scale" className="w-45">
                  <SelectValue placeholder="Select size">
                    {(val) =>
                      fontScaleOptions.find((o) => o.value === String(val))
                        ?.label
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {fontScaleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="high-contrast">High Contrast</Label>
                <p className="text-sm text-muted-foreground">
                  Use high contrast colors for better readability.
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={accessibility.highContrast}
                onCheckedChange={(checked) =>
                  handleUpdate({ highContrast: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reduce-motion">Reduce Motion</Label>
                <p className="text-sm text-muted-foreground">
                  Minimize animations and transitions.
                </p>
              </div>
              <Switch
                id="reduce-motion"
                checked={accessibility.reduceMotion}
                onCheckedChange={(checked) =>
                  handleUpdate({ reduceMotion: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="underline-links">Underline Links</Label>
                <p className="text-sm text-muted-foreground">
                  Always underline links to make them easier to identify.
                </p>
              </div>
              <Switch
                id="underline-links"
                checked={accessibility.underlineLinks}
                onCheckedChange={(checked) =>
                  handleUpdate({ underlineLinks: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
