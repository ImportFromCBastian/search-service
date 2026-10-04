import type { SiteResponse } from '@search-service/shared/schemas/site.schema'

export interface SiteDTO {
  items: SiteResponse[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SitesPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
  }>
}
