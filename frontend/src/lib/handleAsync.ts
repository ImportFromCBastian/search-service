export async function handleAsync<T>(expression: () => Promise<T>) {
  try {
    const data = await expression()
    return { success: true, data, error: null }
  } catch (error) {
    return { success: false, data: null, error }
  }
}
