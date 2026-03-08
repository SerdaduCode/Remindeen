import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useSettings } from "@/hooks/use-settings"
import Header from "@/components/remindeen/Header"
import Loading from "@/components/remindeen/Loading"
import Footer from "@/components/remindeen/Footer"
import Support from "@/components/remindeen/Support"
import About from "@/components/remindeen/About"
import Theme from "@/components/remindeen/Theme"
import Language from "@/components/remindeen/Language"
import AppTab from "@/components/remindeen/AppTab"

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
                <Theme></Theme>
                <Separator />
                <Language></Language>
                <Separator />
                <About />
                <Separator />
                <Support />
                <Separator></Separator>
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
