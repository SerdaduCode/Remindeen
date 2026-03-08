import { useSettingsStore } from "@/stores/settings"

export function useTranslation() {
  const lang = useSettingsStore((s) => s.language)

  const config = useAppConfig()

  const t = (key: string) => {
    return config.translation?.[key]?.[lang] ?? key
  }

  return { t, lang }
}