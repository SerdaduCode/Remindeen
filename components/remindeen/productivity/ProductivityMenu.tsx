import { useEffect, useRef, useState } from "react";
import { KeyRound, LogOut, Settings } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface ProductivityMenuProps {
  onSignOut: () => void;
  onOpenApiKeys: () => void;
}

function ProductivityMenu({ onSignOut, onOpenApiKeys }: ProductivityMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="absolute bottom-4 right-4 z-30">
      {open && (
        <div className="absolute bottom-12 right-0 w-44 overflow-hidden rounded-2xl bg-white/10 py-1 ring-1 ring-white/15 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenApiKeys();
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <KeyRound className="h-3.5 w-3.5" />
            {t("mcp.keys.menu_label")}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("auth.sign_out")}
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t("mcp.keys.menu_aria")}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 text-white/70 backdrop-blur-xl outline-none transition hover:bg-white/20 hover:text-white active:scale-90 focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <Settings className="h-4 w-4" />
      </button>
    </div>
  );
}

export default ProductivityMenu;
