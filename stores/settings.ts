import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "system" | "light" | "dark"
type Lang = "en" | "id"

interface SettingsState {
  theme: Theme
  language: Lang
  activeTab: string

  setTheme: (theme: Theme) => void
  setLanguage: (lang: Lang) => void
  setActiveTab: (tab: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      language: "en",
      activeTab: "home",

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: "remindeen-settings",
    }
  )
)