import { useAppConfig } from "#imports"
import { Label } from "@/components/ui/label"
import { Languages } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useSettingsStore } from "@/stores/settings"
import { useTranslation } from "@/hooks/use-translation"

type Lang = "en" | "id"

export default function Language() {
  const config = useAppConfig()
  const languages = config.language?.available ?? []

  const language = useSettingsStore((s) => s.language)
  const setLanguage = useSettingsStore((s) => s.setLanguage)
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-medium flex items-center gap-2">
          <Languages className="h-4 w-4" />
          {t("settings.language")}
        </Label>

        <Select
          value={language}
          onValueChange={(value) => setLanguage(value as Lang)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}