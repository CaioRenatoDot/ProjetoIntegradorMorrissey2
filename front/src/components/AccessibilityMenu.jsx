import { Accessibility, Contrast, RotateCcw, Type, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "watchd_a11y";

const OPTIONS = [
  {
    id: "highContrast",
    className: "a11y-high-contrast",
    Icon: Contrast,
    label: "High contrast",
    description: "Stronger colors and borders for easier reading.",
  },
  {
    id: "largeText",
    className: "a11y-large-text",
    Icon: Type,
    label: "Larger text",
    description: "Increases the text size across the whole site.",
  },
];

function readSavedPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      highContrast: Boolean(saved?.highContrast),
      largeText: Boolean(saved?.largeText),
    };
  } catch {
    return { highContrast: false, largeText: false };
  }
}

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState(readSavedPreferences);
  const panelRef = useRef(null);

  // Aplica as preferencias no <html> e guarda a escolha para as proximas visitas.
  useEffect(() => {
    OPTIONS.forEach((option) => {
      document.documentElement.classList.toggle(
        option.className,
        preferences[option.id]
      );
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Se o navegador bloquear o storage, as preferencias valem so nesta visita.
    }
  }, [preferences]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (panelRef.current?.contains(event.target)) return;
      setIsOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function toggleOption(id) {
    setPreferences((current) => ({ ...current, [id]: !current[id] }));
  }

  const activeCount = OPTIONS.filter((option) => preferences[option.id]).length;

  return (
    <div className="fixed bottom-4 right-4 z-[70] print:hidden" ref={panelRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            aria-label="Accessibility options"
            className="absolute bottom-14 right-0 w-72 max-w-[calc(100vw-2rem)] origin-bottom-right rounded-lg border border-zinc-700 bg-zinc-900 p-4 shadow-2xl shadow-black/60"
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            role="dialog"
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-wide text-white">
                Accessibility
              </h2>
              <button
                aria-label="Close accessibility options"
                className="grid h-7 w-7 place-items-center rounded text-slate-400 transition hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c030]/70"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {OPTIONS.map(({ id, Icon, label, description }) => {
                const isActive = preferences[id];

                return (
                  <button
                    aria-pressed={isActive}
                    className={`flex w-full items-start gap-3 rounded-md border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c030]/70 ${
                      isActive
                        ? "border-[#00c030] bg-[#00c030]/10"
                        : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/60"
                    }`}
                    key={id}
                    onClick={() => toggleOption(id)}
                    type="button"
                  >
                    <Icon
                      aria-hidden="true"
                      className={`mt-0.5 h-4 w-4 flex-none ${
                        isActive ? "text-[#00c030]" : "text-slate-400"
                      }`}
                    />
                    <span className="min-w-0">
                      <span
                        className={`block text-sm font-bold ${
                          isActive ? "text-white" : "text-slate-200"
                        }`}
                      >
                        {label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-400">
                        {description}
                      </span>
                    </span>
                    <span
                      className={`mt-0.5 flex-none rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${
                        isActive
                          ? "bg-[#00c030] text-black"
                          : "bg-zinc-800 text-slate-400"
                      }`}
                    >
                      {isActive ? "On" : "Off"}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeCount > 0 && (
              <button
                className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c030]/70"
                onClick={() =>
                  setPreferences({ highContrast: false, largeText: false })
                }
                type="button"
              >
                <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                Reset to default
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        aria-expanded={isOpen}
        aria-label="Accessibility options"
        className="relative grid h-12 w-12 place-items-center rounded-full border border-zinc-700 bg-zinc-900 text-slate-200 shadow-xl shadow-black/50 transition hover:border-[#00c030] hover:text-[#00c030] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c030]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#14181c]"
        onClick={() => setIsOpen((current) => !current)}
        title="Accessibility options"
        type="button"
        whileTap={{ scale: 0.92 }}
      >
        <Accessibility aria-hidden="true" className="h-6 w-6" strokeWidth={2.2} />
        {activeCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-[#00c030] text-[10px] font-black text-black"
          >
            {activeCount}
          </span>
        )}
      </motion.button>
    </div>
  );
}
