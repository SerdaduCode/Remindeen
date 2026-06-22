import Pager from "@/components/remindeen/pager/Pager";
import OrbitView from "@/components/remindeen/orbit/OrbitView";
import HomePage from "./HomePage";
import { useTranslation } from "@/hooks/use-translation";

function App() {
  const { t } = useTranslation();

  return (
    <Pager labels={[t("pager.page_home"), t("pager.page_orbit")]}>
      <HomePage />
      <OrbitView />
    </Pager>
  );
}

export default App;
