import { create } from "zustand"
import { storage } from "#imports"

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

const appearanceSettings = storage.defineItem<{ theme: Theme }>('local:appearanceSettings', {
  fallback: { theme: 'system' }
})

const uiSettings = storage.defineItem<{ activeTab: string; language: Lang }>('local:uiSettings', {
  fallback: { activeTab: 'home', language: 'en' }
})

export const useSettingsStore = create<SettingsState>((set) => {
  // Sync state initially
  Promise.all([
    appearanceSettings.getValue(),
    uiSettings.getValue()
  ]).then(([appearance, ui]) => {
    set({
      theme: appearance?.theme || 'system',
      language: ui?.language || 'en',
      activeTab: ui?.activeTab || 'home'
    })
  })

  // Watch WXT storage changes to sync back to Zustand
  appearanceSettings.watch((newVal) => {
    if (newVal) {
      set({ theme: newVal.theme })
    }
  })

  uiSettings.watch((newVal) => {
    if (newVal) {
      set({
        language: newVal.language,
        activeTab: newVal.activeTab
      })
    }
  })

  return {
    theme: "system",
    language: "en",
    activeTab: "home",

    setTheme: (theme) => {
      set({ theme })
      appearanceSettings.setValue({ theme })
    },
    setLanguage: (language) => {
      set({ language })
      uiSettings.getValue().then((current) => {
        uiSettings.setValue({ ...current, language })
      })
    },
    setActiveTab: (activeTab) => {
      set({ activeTab })
      uiSettings.getValue().then((current) => {
        uiSettings.setValue({ ...current, activeTab })
      })
    },
  }
})