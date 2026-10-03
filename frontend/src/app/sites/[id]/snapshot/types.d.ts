import type { SnapshotResponse } from '@search-service/shared/schemas/snapshot.schema'

export interface SnapshotsDTO {
  items: SnapshotResponse[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SnapshotsPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    page?: string
    limit?: string
    status?: string
    includeArchived?: string
  }>
}
