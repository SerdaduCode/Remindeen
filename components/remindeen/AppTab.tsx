import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarCheck, Settings, ChartNoAxesCombined } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

export default function AppTab() {
  const { t } = useTranslation()

  const tabs = [
    { value: "home", label: t('tabs.home'), icon: CalendarCheck },
    { value: "trends", label: t('tabs.trends'), icon: ChartNoAxesCombined },
    { value: "settings", label: t('tabs.settings'), icon: Settings },
  ]

  return (
    <TabsList className="h-auto rounded-none border-b bg-transparent p-0 w-full">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:after:bg-primary relative rounded-none py-2 px-4 flex items-center gap-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1"
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </TabsTrigger>
        )
      })}
    </TabsList>
  )
}
