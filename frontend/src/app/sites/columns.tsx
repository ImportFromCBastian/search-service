'use client'

import type { SiteResponse } from '@search-service/shared/schemas/site.schema'
import { createColumnHelper } from '@tanstack/react-table'
import type { DataTableFeatures } from './data-table-feature'

const columnHelper = createColumnHelper<DataTableFeatures, SiteResponse>()

export const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Name',
  }),
  columnHelper.accessor('url', {
    header: 'URL',
  }),
  columnHelper.accessor('depth', {
    header: 'Depth',
  }),
  columnHelper.accessor('lastSnapshot.at', {
    header: 'Last Snapshot',
  }),
  columnHelper.accessor('lastSnapshot.status', {
    header: 'Status',
  }),
  columnHelper.accessor('lastSnapshot.snapshotId', {
    header: 'See snapshot',
  }),
])
