import { Label } from "@/components/ui/label"
import { Heart } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

const Support = () => {
  const { t } = useTranslation()

  return (
    <div>
      <Label className="text-lg font-medium">
        <Heart className="h-4  w-4"></Heart>{t("settings.support")}
      </Label>
      <p className="text-xs text-muted-foreground">{t("settings.support.description")}</p>
      <div className="flex items-center justify-center mt-4">
        <img src="https://fczwbsfeacryvaxwuzzp.supabase.co/storage/v1/object/public/qr/support.jpeg" loading="lazy" width={250} height={250} />
      </div>
    </div>
  )
}

export default Support
