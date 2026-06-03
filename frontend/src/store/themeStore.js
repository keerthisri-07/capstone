import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: true,

      toggleTheme: () => {
        const newDark = !get().isDark
        set({ isDark: newDark })
        document.documentElement.classList.toggle('dark', newDark)
      },

      init: () => {
        const isDark = get().isDark
        document.documentElement.classList.toggle('dark', isDark)
      },
    }),
    { name: 'theme-storage' }
  )
)
