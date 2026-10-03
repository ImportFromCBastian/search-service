import { BACKEND_URL } from './config'

export interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | Record<string, unknown> | unknown[] | null
  params?: Record<string, string | number | boolean | undefined | null>
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: unknown
  ) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message: unknown }).message)
        : `Request failed with status ${status}: ${statusText}`
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Helper tipado para realizar peticiones HTTP tanto en Server Components como en Server Actions o Client Components.
 * Chequea response.ok y serializa/deserializa JSON automáticamente.
 */
export async function fetchJson<T>(
  endpointOrUrl: string,
  options: FetchOptions = {}
): Promise<{
  success: boolean
  data: T | null
  error: Error | null
  status?: number
}> {
  try {
    const { params, headers, body, ...restOptions } = options

    // Resolver URL completa
    let url =
      endpointOrUrl.startsWith('http://') ||
      endpointOrUrl.startsWith('https://')
        ? endpointOrUrl
        : `${BACKEND_URL}${endpointOrUrl.startsWith('/') ? '' : '/'}${endpointOrUrl}`
    // Agregar query params si existen
    if (params) {
      const searchParams = new URLSearchParams()
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      }
      const queryString = searchParams.toString()
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString
      }
    }

    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...(headers as Record<string, string>),
    }

    let requestBody: BodyInit | undefined
    if (body !== undefined && body !== null) {
      if (
        typeof body === 'object' &&
        !(body instanceof FormData) &&
        !(body instanceof Blob)
      ) {
        requestHeaders['Content-Type'] = 'application/json'
        requestBody = JSON.stringify(body)
      } else {
        requestBody = body as BodyInit
      }
    }

    const response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
      body: requestBody,
    })

    if (!response.ok) {
      let errorData: unknown = null
      try {
        errorData = await response.json()
      } catch {
        errorData = await response.text()
      }
      throw new ApiError(response.status, response.statusText, errorData)
    }

    if (response.status === 204) {
      return { success: true, data: null as T, error: null, status: 204 }
    }

    const data = (await response.json()) as T

    return { success: true, data, error: null, status: response.status }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    return {
      success: false,
      data: null,
      error,
      status: err instanceof ApiError ? err.status : undefined,
    }
  }
}
