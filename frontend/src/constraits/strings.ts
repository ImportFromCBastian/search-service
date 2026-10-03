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
]
