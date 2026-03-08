import { useAppConfig } from "#imports"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSettings } from "@/hooks/use-settings"
import { useTheme } from "@/hooks/use-theme"
import { User, CalendarCheck, Monitor, Moon, Settings, Sun, ChartNoAxesCombined, Palette, Languages, Info, Heart } from "lucide-react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function App() {
  const config = useAppConfig()
  const { appearance, ui, loading, updateAppearance, updateUI } = useSettings()
  const { setTheme } = useTheme({
    theme: appearance.theme,
    onThemeChange: (theme) => updateAppearance({ theme }),
  })

  const languages = config.language?.available ?? []
  const defaultLang = config.language?.default ?? "en"

  const themeOptions = [
    { value: "system", label: "System", icon: Monitor },
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ] as const

  const handleTabChange = (value: string) => {
    updateUI({ activeTab: value })
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-24 rounded-lg bg-primary flex items-center justify-center">
            <img src="/icon/logo.png" className="cursor-pointer rounded-md hover:drop-shadow-[0_0_2em_#3c9934e0] transition duration-300 ease-in-out" loading="lazy" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Remindeen</h1>
            <p className="text-sm text-muted-foreground">Prayer reminders and daily inspiration while you browse</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={ui.activeTab} onValueChange={handleTabChange} className="h-full flex flex-col gap-0">
          <TabsList className="h-auto rounded-none border-b bg-transparent p-0 w-full">
            <TabsTrigger
              value="home"
              className="data-[state=active]:after:bg-primary relative rounded-none py-2 px-4 flex items-center gap-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1"
            >
              <CalendarCheck className="h-4 w-4" />
              Today
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="data-[state=active]:after:bg-primary relative rounded-none py-2 px-4 flex items-center gap-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1"
            >
              <ChartNoAxesCombined className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:after:bg-primary relative rounded-none py-2 px-4 flex items-center gap-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1"
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
            </ScrollArea>
          </TabsContent>

          <TabsContent value="trends" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full"></ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-8 p-4">
                {/* Account Details */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Account Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Username</span>
                      <span className="text-sm font-medium">Dhyoga</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="text-sm font-medium">dhyogap@gmail.com</span>
                      {/* <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                      >
                        Active
                      </Badge> */}
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Member Since</span>
                      <span className="text-sm font-medium">July 2025</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-3">
                  <Button className="w-full">Edit Profile</Button>
                </div>
              </div>
              <div className="space-y-6 p-4">
                {/* Appearance Settings */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-base flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Appearance
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">Customize the look and feel</p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Theme</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {themeOptions.map((option) => {
                        const Icon = option.icon
                        const isActive = appearance.theme === option.value
                        return (
                          <Button key={option.value} variant={isActive ? "default" : "outline"} size="sm" onClick={() => setTheme(option.value)} className="flex flex-col gap-1 h-auto py-3">
                            <Icon className="h-4 w-4" />
                            <span className="text-xs">{option.label}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* System Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-lg font-medium">
                        <Languages className="h-4  w-4"></Languages>Language
                      </Label>
                      {/* <p className="text-xs text-muted-foreground">Token limit from runtime config</p> */}
                    </div>
                    <Select defaultValue={defaultLang}>
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
                  <Separator />
                  <div>
                    <div className="mb-4">
                      <Label className="text-lg font-medium">
                        <Info className="h-4  w-4"></Info>
                        About
                      </Label>
                    </div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-center">
                          Remindeen &nbsp;
                          <Badge variant="secondary">v1.3.0</Badge>
                        </CardTitle>
                        <CardDescription>{config.about}</CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                  <Separator />
                  <div className="">
                      <Label className="text-lg font-medium">
                        <Heart className="h-4  w-4"></Heart>Support
                      </Label>
                      <p className="text-xs text-muted-foreground">Show your love by scanning the QR code below ❤️</p>
                    <img src="/icon/support.jpeg" loading="lazy" width={250} height={250} />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
