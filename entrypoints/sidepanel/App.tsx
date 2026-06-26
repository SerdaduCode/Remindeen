import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useSettings } from "@/hooks/use-settings"
import Header from "@/components/remindeen/sidepanel/Header"
import Loading from "@/components/remindeen/sidepanel/Loading"
import Footer from "@/components/remindeen/sidepanel/Footer"
import Support from "@/components/remindeen/sidepanel/Support"
import About from "@/components/remindeen/sidepanel/About"
import Theme from "@/components/remindeen/sidepanel/Theme"
import Language from "@/components/remindeen/sidepanel/Language"
import CalendarConnection from "@/components/remindeen/sidepanel/CalendarConnection"
import AppTab from "@/components/remindeen/sidepanel/AppTab"
import Today from "@/components/remindeen/sidepanel/Today"
import RecentActivity from "@/components/remindeen/sidepanel/RecentActivity"
import SearchBarToggle from "@/components/remindeen/sidepanel/SearchBarToggle"

function App() {
  const { ui, loading, updateUI } = useSettings()

  const handleTabChange = (value: string) => {
    updateUI({ activeTab: value })
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      <div className="flex-1 overflow-hidden">
        <Tabs value={ui.activeTab} onValueChange={handleTabChange} className="h-full flex flex-col gap-0">
          <AppTab />
          <TabsContent value="home" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-4 p-4">
                <Today />
              </div>
              <Separator />
              <div className="space-y-4 p-4">
                <Theme></Theme>
                <Separator />
                <Language></Language>
                <Separator />
                <CalendarConnection />
                <Separator />
                <SearchBarToggle />
                <Separator />
                <About />
                <Separator />
                <Footer></Footer>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
