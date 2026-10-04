import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

export type FontScaleValue = 1 | 1.1 | 1.25

export type DefaultPageSize = 10 | 25 | 50
export type Density = 'compact' | 'comfortable'

export interface AccessibilitySettings {
  fontScale: FontScaleValue
  highContrast: boolean
  reduceMotion: boolean
  underlineLinks: boolean
}

export interface TablePreferences {
  defaultPageSize: DefaultPageSize
  density: Density
}

interface SettingsState {
  accessibility: AccessibilitySettings
  table: TablePreferences
  setAccessibility: (patch: Partial<AccessibilitySettings>) => void
  setTable: (patch: Partial<TablePreferences>) => void
  resetAll: () => void
}

const ACCESSIBILITY_DEFAULTS: AccessibilitySettings = {
  fontScale: 1,
  highContrast: false,
  reduceMotion: false,
  underlineLinks: false,
}

const TABLE_DEFAULTS: TablePreferences = {
  defaultPageSize: 10,
  density: 'comfortable',
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 año

function setCookie(name: string, value: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

export function applyAccessibilityToDOM(accessibility: AccessibilitySettings) {
  if (typeof document === 'undefined') return
  const html = document.documentElement

  html.style.setProperty('--font-scale', String(accessibility.fontScale))
  html.style.fontSize = `${accessibility.fontScale * 100}%`

  if (accessibility.highContrast) {
    html.classList.add('high-contrast')
  } else {
    html.classList.remove('high-contrast')
  }

  if (accessibility.reduceMotion) {
    html.classList.add('reduce-motion')
  } else {
    html.classList.remove('reduce-motion')
  }

  if (accessibility.underlineLinks) {
    html.classList.add('underline-links')
  } else {
    html.classList.remove('underline-links')
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    subscribeWithSelector((set) => ({
      accessibility: ACCESSIBILITY_DEFAULTS,
      table: TABLE_DEFAULTS,
      setAccessibility: (patch) =>
        set((s) => ({ accessibility: { ...s.accessibility, ...patch } })),
      setTable: (patch) => set((s) => ({ table: { ...s.table, ...patch } })),
      resetAll: () =>
        set({ accessibility: ACCESSIBILITY_DEFAULTS, table: TABLE_DEFAULTS }),
    })),
    { name: 'search-service-settings', version: 1 }
  )
)

// Mantiene el DOM sincronizado en tiempo real con las opciones de accesibilidad
useSettingsStore.subscribe(
  (state) => state.accessibility,
  (accessibility) => {
    applyAccessibilityToDOM(accessibility)
  },
  { fireImmediately: true }
)

// Mantiene las cookies `ss_page_size` / `ss_density` al día para que los
// Server Components puedan leerlas en el próximo request.
useSettingsStore.subscribe(
  (state) => state.table,
  (table) => {
    setCookie('ss_page_size', String(table.defaultPageSize))
    setCookie('ss_density', table.density)
  },
  { fireImmediately: true }
)
