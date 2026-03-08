import { Button } from "@/components/ui/button"
import { useSettings } from "@/hooks/use-settings"
import { useTheme } from "@/hooks/use-theme"
import { Monitor, Moon, Sun, Palette } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

export default function Theme() {
  const { appearance, updateAppearance } = useSettings()

  const { setTheme } = useTheme({
    theme: appearance.theme,
    onThemeChange: (theme) => updateAppearance({ theme }),
  })

  const { t } = useTranslation()

  const themeOptions = [
    { value: "system", label: t('settings.theme.system'), icon: Monitor },
    { value: "light", label: t('settings.theme.light'), icon: Sun },
    { value: "dark", label: t('settings.theme.dark'), icon: Moon },
  ] as const

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="h-4 w-4" />
          {t("settings.theme")}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t("settings.theme.description")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {themeOptions.map((option) => {
          const Icon = option.icon
          const isActive = appearance.theme === option.value

          return (
            <Button
              key={option.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(option.value)}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{option.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}