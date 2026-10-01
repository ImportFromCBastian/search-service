import { handleAsync } from '../handleAsync'

export async function useFetch<T>(
  url: string
): Promise<{ success: boolean; data: T | null; error: unknown | null }> {
  const { success, data, error } = await handleAsync(() =>
    fetch(url).then((res) => res.json())
  )
  return { success, data, error }
}
