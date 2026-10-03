'use server'

import type { BatchAction } from '@search-service/shared/enums/crawl.enum'
import { revalidatePath } from 'next/cache'
import { fetchJson } from '@/lib/fetchJson'

export async function publishSnapshotAction(
  siteId: string,
  snapshotId: string
) {
  try {
    const res = await fetchJson(`/snapshots/${snapshotId}/publish`, {
      method: 'POST',
    })

    if (!res.success) {
      return {
        success: false,
        error: res.error?.message || 'Error al publicar el snapshot',
      }
    }

    revalidatePath(`/sites/${siteId}/snapshot`)
    revalidatePath('/sites')
    return { success: true, error: null }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error inesperado',
    }
  }
}

export async function unpublishSnapshotAction(
  siteId: string,
  snapshotId: string
) {
  try {
    const res = await fetchJson(`/snapshots/${snapshotId}/unpublish`, {
      method: 'POST',
    })

    if (!res.success) {
      return {
        success: false,
        error: res.error?.message || 'Error al despublicar el snapshot',
      }
    }

    revalidatePath(`/sites/${siteId}/snapshot`)
    revalidatePath('/sites')
    return { success: true, error: null }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error inesperado',
    }
  }
}

export async function triggerSnapshotAction(siteId: string) {
  try {
    const res = await fetchJson('/snapshots', {
      method: 'POST',
      body: { siteId },
    })

    if (!res.success) {
      return {
        success: false,
        error: res.error?.message || 'Error al iniciar el snapshot',
      }
    }

    revalidatePath(`/sites/${siteId}/snapshot`)
    revalidatePath('/sites')
    return { success: true, error: null }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error inesperado',
    }
  }
}

export async function cancelSnapshotAction(siteId: string, snapshotId: string) {
  try {
    const res = await fetchJson(`/snapshots/${snapshotId}/cancel`, {
      method: 'POST',
    })

    if (!res.success) {
      return {
        success: false,
        error: res.error?.message || 'Error al cancelar el snapshot',
      }
    }

    revalidatePath(`/sites/${siteId}/snapshot`)
    revalidatePath('/sites')
    return { success: true, error: null }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error inesperado',
    }
  }
}

export async function batchSnapshotAction(
  siteId: string,
  ids: string[],
  action: BatchAction
) {
  try {
    const res = await fetchJson('/snapshots/batch', {
      method: 'POST',
      body: { ids, action },
    })

    if (!res.success) {
      return {
        success: false,
        error: res.error?.message || 'Error al ejecutar acción en lote',
      }
    }

    revalidatePath(`/sites/${siteId}/snapshot`)
    revalidatePath('/sites')
    return { success: true, error: null }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error inesperado',
    }
  }
}
