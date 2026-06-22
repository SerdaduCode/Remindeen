import { LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import KanbanBoard from "../kanban/KanbanBoard";
import HabitTracker from "../habit/HabitTracker";
import SignInPrompt from "./SignInPrompt";

function ProductivityPage() {
  const { isSignedIn, loading, signingIn, error, signIn, signOut } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-950 text-white">
      {!loading && isSignedIn && (
        <button
          type="button"
          onClick={signOut}
          aria-label={t("auth.sign_out")}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 outline-none transition hover:bg-white/10 hover:text-white active:scale-90 focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <LogOut className="h-4 w-4" />
        </button>
      )}

      {loading ? null : !isSignedIn ? (
        <SignInPrompt signingIn={signingIn} error={error} onSignIn={signIn} />
      ) : (
        <Tabs defaultValue="kanban" className="h-full gap-0">
          <div className="flex justify-center pt-4">
            <TabsList>
              <TabsTrigger value="kanban">{t("productivity.tab_kanban")}</TabsTrigger>
              <TabsTrigger value="habit">{t("productivity.tab_habit")}</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="kanban" className="overflow-hidden">
            <KanbanBoard />
          </TabsContent>
          <TabsContent value="habit" className="overflow-y-auto">
            <HabitTracker />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default ProductivityPage;
