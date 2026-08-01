import { CheckCircle2, CircleAlert } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

const TOAST_DURATION_MS = 3500;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const nextIdRef = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (message, tone = "success") => {
      nextIdRef.current += 1;
      const id = nextIdRef.current;

      setToasts((currentToasts) => [...currentToasts, { id, message, tone }]);
      window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
    },
    [dismissToast]
  );

  return { toasts, pushToast, dismissToast };
}

export function ToastStack({ onDismiss, toasts }) {
  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col gap-2 sm:inset-x-auto sm:right-6 sm:top-6 sm:w-80">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const isError = toast.tone === "error";
          const Icon = isError ? CircleAlert : CheckCircle2;

          return (
            <motion.button
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`pointer-events-auto flex w-full items-start gap-3 rounded-md border bg-[#1a1f24]/95 px-4 py-3 text-left shadow-xl shadow-black/40 backdrop-blur-sm ${
                isError ? "border-red-800/70" : "border-[#00c030]/40"
              }`}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              key={toast.id}
              layout
              onClick={() => onDismiss(toast.id)}
              transition={{ duration: 0.2, ease: "easeOut" }}
              type="button"
            >
              <Icon
                aria-hidden="true"
                className={`mt-0.5 h-4 w-4 flex-none ${
                  isError ? "text-red-400" : "text-[#00c030]"
                }`}
              />
              <span className="text-sm font-semibold leading-5 text-slate-100">
                {toast.message}
              </span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
