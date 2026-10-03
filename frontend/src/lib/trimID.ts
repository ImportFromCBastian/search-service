export function trimID(id: string): string {
  if (id.length <= 8) {
    return id
  }
  return id.slice(-6)
}
