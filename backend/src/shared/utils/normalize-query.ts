export function normalizeQuery(query: string): string {
  return query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
