import Pager from "@/components/remindeen/pager/Pager";
import ProductivityPage from "@/components/remindeen/productivity/ProductivityPage";
import HomePage from "./HomePage";
import { useTranslation } from "@/hooks/use-translation";

function App() {
  const { t } = useTranslation();

  return (
    <Pager labels={[t("pager.page_home"), t("pager.page_productivity")]}>
      <HomePage />
      <ProductivityPage />
    </Pager>
  );
}

export default App;
