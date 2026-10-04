'use client'

import { useEffect } from 'react'
import {
  applyAccessibilityToDOM,
  useSettingsStore,
} from '@/store/settings-store'

export function AccessibilityEffects() {
  const accessibility = useSettingsStore((state) => state.accessibility)
  const setAccessibility = useSettingsStore((state) => state.setAccessibility)

  useEffect(() => {
    // Respect system preference for reduced motion on first load if never configured
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('search-service-settings')
      if (!savedSettings) {
        const prefersReducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches
        if (prefersReducedMotion) {
          setAccessibility({ reduceMotion: true })
        }
      }
    }
  }, [setAccessibility])

  useEffect(() => {
    applyAccessibilityToDOM(accessibility)
  }, [accessibility])

  return null
}
