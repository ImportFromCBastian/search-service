'use server'

import { revalidatePath } from 'next/cache'
import { fetchJson } from '@/lib/fetchJson'

export async function regenerateApiKeyAction(siteId: string) {
  const result = await fetchJson<{ apiKey: string }>(
    `/sites/${siteId}/regenerate-api-key`,
    {
      method: 'POST',
      cache: 'no-store',
    }
  )

  if (result.success) {
    revalidatePath('/configuration/api-keys')
  }

  return result
}

export async function revalidateSettingsAction() {
  revalidatePath('/', 'layout')
}
