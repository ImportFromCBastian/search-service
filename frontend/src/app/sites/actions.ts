'use server'

import type {
  CreateSiteInput,
  SiteCreatedResponse,
} from '@search-service/shared/schemas/site.schema'
import { revalidatePath } from 'next/cache'
import { fetchJson } from '@/lib/fetchJson'

export async function createSiteAction(input: CreateSiteInput): Promise<{
  success: boolean
  data: SiteCreatedResponse | null
  error: string | null
}> {
  try {
    const res = await fetchJson<SiteCreatedResponse>('/sites', {
      method: 'POST',
      body: input,
    })

    if (!res.success || !res.data) {
      return {
        success: false,
        data: null,
        error: res.error?.message || 'Error al crear el sitio',
      }
    }

    revalidatePath('/sites')
    return {
      success: true,
      data: res.data,
      error: null,
    }
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Error inesperado',
    }
  }
}
