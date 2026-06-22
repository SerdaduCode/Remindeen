import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PagerProps {
  children: [React.ReactNode, React.ReactNode];
  labels: [string, string];
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

function Pager({ children, labels }: PagerProps) {
  const [activeIndex, setActiveIndex] = useState<0 | 1>(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (event.key === "ArrowRight") setActiveIndex((index) => (index === 0 ? 1 : index));
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index === 1 ? 0 : index));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-zinc-950">
      <div
        className="flex h-full w-[200%] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(-${activeIndex * 50}%)` }}
      >
        {children.map((page, index) => (
          <div
            key={index}
            aria-hidden={activeIndex !== index}
            className={`relative h-full w-1/2 shrink-0 overflow-hidden ${
              activeIndex === index ? "" : "pointer-events-none"
            }`}
          >
            {page}
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous page"
        onClick={() => setActiveIndex(0)}
        disabled={activeIndex === 0}
        className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-white/60 outline-none transition hover:bg-white/10 hover:text-white active:scale-90 focus-visible:ring-2 focus-visible:ring-white/40 disabled:pointer-events-none disabled:opacity-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next page"
        onClick={() => setActiveIndex(1)}
        disabled={activeIndex === 1}
        className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-white/60 outline-none transition hover:bg-white/10 hover:text-white active:scale-90 focus-visible:ring-2 focus-visible:ring-white/40 disabled:pointer-events-none disabled:opacity-0"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {labels.map((label, index) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            aria-current={activeIndex === index}
            onClick={() => setActiveIndex(index as 0 | 1)}
            className="cursor-pointer p-1.5 outline-none"
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default Pager;
