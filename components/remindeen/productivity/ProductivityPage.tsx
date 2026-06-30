import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import KanbanBoard from "../kanban/KanbanBoard";
import HabitTracker from "../habit/HabitTracker";
import CalendarView from "../calendar/CalendarView";
import Today from "../browser-tracking/Today";
import RecentActivity from "../browser-tracking/RecentActivity";
import SignInPrompt from "./SignInPrompt";
import ProductivityMenu from "./ProductivityMenu";
import ApiKeysModal from "./ApiKeysModal";

interface ProductivityPageProps {
  backgroundUrl: string;
}

const GLASS_PANEL =
  "rounded-3xl bg-white/10 backdrop-blur-xl ring-1 ring-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden";

function ProductivityPage({ backgroundUrl }: ProductivityPageProps) {
  const { isSignedIn, loading, signingIn, error, signIn, signOut } = useAuth();
  const [showApiKeys, setShowApiKeys] = useState(false);

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
        <ProductivityMenu onSignOut={signOut} onOpenApiKeys={() => setShowApiKeys(true)} />
      )}

      {loading ? null : !isSignedIn ? (
        <div className="relative z-10 h-full">
          <SignInPrompt signingIn={signingIn} error={error} onSignIn={signIn} />
        </div>
      ) : (
        <div className="relative z-10 grid h-full gap-4 overflow-y-auto p-4 md:grid-cols-[320px_minmax(0,1fr)_320px] md:overflow-hidden md:p-6">
          <div className="flex flex-col gap-4 min-h-0">
            <section className={`${GLASS_PANEL} flex min-h-0 flex-col`}>
              <HabitTracker />
            </section>
            <section className={`${GLASS_PANEL} flex min-h-0 flex-col`}>
              <CalendarView />
            </section>
          </div>
          <section className={`${GLASS_PANEL} flex min-h-0 flex-col`}>
            <KanbanBoard />
          </section>
          <div className="flex flex-col gap-4 min-h-0">
            <section className={`${GLASS_PANEL} flex min-h-0 flex-col`}>
              <Today />
            </section>
            <section className={`${GLASS_PANEL} flex min-h-0 flex-col`}>
              <RecentActivity />
            </section>
          </div>
        </div>
      )}

      {showApiKeys && <ApiKeysModal onClose={() => setShowApiKeys(false)} />}
    </div>
  );
}

export default ProductivityPage;
