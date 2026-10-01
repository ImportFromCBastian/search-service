import type { SiteResponse } from '@search-service/shared/schemas/site.schema'
import { useFetch } from '@/lib/hooks/useFetch'
import { columns } from './columns'
import { DataTable } from './data-table'
type SiteDTO = {
  items: SiteResponse[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default async function SitesPage() {
  const { success, data } = await useFetch<SiteDTO>(
    `http://localhost:4000/sites`
  )

  if (!success) {
    return <div>Error fetching sites</div>
  }

  if(!data || data.items.length === 0) {
    return <div>No sites found</div>
  }
  
  return (
    <section>
      <h2>My sites</h2>
      <DataTable columns={columns} data={data.items} />
    </section>
  )
}
