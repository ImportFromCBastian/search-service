export type NavBarString = {
  title: string
  href: string
}

export const navBarStrings: NavBarString[] = [
  {
    title: 'Sites',
    href: '/sites',
  },
  {
    title: 'Search',
    href: '/search',
  },
  {
    title: 'Configuration',
    href: '/configuration',
  },
]

export const frequencyOptions = [
  {
    value: 'daily',
    label: 'Diario',
  },
  {
    value: 'weekly',
    label: 'Semanal',
  },
  {
    value: 'monthly',
    label: 'Mensual',
  },
] as const

export const fontScaleOptions = [
  { value: '1', label: 'Default (100%)' },
  { value: '1.1', label: 'Large (110%)' },
  { value: '1.25', label: 'Extra Large (125%)' },
] as const

export const pageSizeOptions = [
  { value: '10', label: '10 rows' },
  { value: '25', label: '25 rows' },
  { value: '50', label: '50 rows' },
] as const

export const densityOptions = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
] as const

export const snapshotStatusOptions = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'completed', label: 'Completado' },
  { value: 'running', label: 'En curso' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'failed', label: 'Fallido' },
] as const
