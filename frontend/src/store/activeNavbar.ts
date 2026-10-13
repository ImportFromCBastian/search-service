import { create } from 'zustand'

type Store = {
  activeNavbar: boolean
  setActiveNavbar: (navbar: boolean) => void
}

export const useActiveNavbarStore = create<Store>()(
  (set: (update: Partial<Store>) => void) => ({
    activeNavbar: false,
    setActiveNavbar: (navbar: boolean) => set({ activeNavbar: navbar }),
  })
)
