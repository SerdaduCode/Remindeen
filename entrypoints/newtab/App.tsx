import Pager from "@/components/remindeen/pager/Pager";
import ProductivityPage from "@/components/remindeen/productivity/ProductivityPage";
import HomePage from "./HomePage";
import { useTranslation } from "@/hooks/use-translation";
import { useBackgroundImage } from "@/hooks/use-background-image";

function App() {
  const { t } = useTranslation();
  const backgroundUrl = useBackgroundImage();

  return (
    <Pager labels={[t("pager.page_home"), t("pager.page_productivity")]}>
      <HomePage backgroundUrl={backgroundUrl} />
      <ProductivityPage backgroundUrl={backgroundUrl} />
    </Pager>
  );
}

export default App;
