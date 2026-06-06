import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/hooks/use-translation"

const About = () => {
  const { t } = useTranslation()

  return (
    <div>
      <div className="mb-4">
        <Label className="text-lg font-medium flex items-center gap-2">
          <Info className="h-4 w-4" />
          {t("settings.about")}
        </Label>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-center">
            Remindeen &nbsp;
            <Badge variant="secondary">v1.3.0</Badge>
          </CardTitle>

          <CardDescription>
            {t("settings.about.description")}
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="pt-4">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">Sharing your thoughts and feedback <a className="text-primary underline" href="mailto:admin@serdadu.dev">here</a>, thank you.</p>
      </div>
    </div>
  )
}

export default About