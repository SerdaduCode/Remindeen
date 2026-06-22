import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import KanbanBoard from "../kanban/KanbanBoard";
import HabitTracker from "../habit/HabitTracker";
import SignInPrompt from "./SignInPrompt";

interface ProductivityPageProps {
  backgroundUrl: string;
}

const GLASS_PANEL =
  "rounded-3xl bg-white/10 backdrop-blur-xl ring-1 ring-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden";

function ProductivityPage({ backgroundUrl }: ProductivityPageProps) {
  const { isSignedIn, loading, signingIn, error, signIn, signOut } = useAuth();
  const { t } = useTranslation();

  return (
    <div
      className="relative h-full w-full overflow-hidden text-white"
      style={
        backgroundUrl
          ? {
              backgroundImage: `url(${backgroundUrl})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }
          : { backgroundColor: "rgb(9 9 11)" }
      }
    >
      {/* Dark gradient overlay keeps panel content legible over any photo */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

      {!loading && isSignedIn && (
        <button
          type="button"
          onClick={signOut}
          aria-label={t("auth.sign_out")}
          className="absolute bottom-4 right-4 z-30 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 text-white/70 backdrop-blur-xl outline-none transition hover:bg-white/20 hover:text-white active:scale-90 focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <LogOut className="h-4 w-4" />
        </button>
      )}

      {loading ? null : !isSignedIn ? (
        <div className="relative z-10 h-full">
          <SignInPrompt signingIn={signingIn} error={error} onSignIn={signIn} />
        </div>
      ) : (
        <div className="relative z-10 grid h-full gap-4 overflow-y-auto p-4 md:grid-cols-[320px_minmax(0,1fr)] md:overflow-hidden md:p-6">
          <section className={`${GLASS_PANEL} flex min-h-0 flex-col`}>
            <HabitTracker />
          </section>
          <section className={`${GLASS_PANEL} flex min-h-0 flex-col`}>
            <KanbanBoard />
          </section>
        </div>
      )}
    </div>
  );
}

export default ProductivityPage;
