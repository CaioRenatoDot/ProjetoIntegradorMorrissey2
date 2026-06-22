import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ children, onClose, title }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
      role="presentation"
    >
      <div
        aria-label={title}
        aria-modal="true"
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-5">
          <h2 className="truncate text-2xl font-black text-white">{title}</h2>
          <button
            aria-label="Close"
            className="grid h-10 w-10 flex-none place-items-center rounded-full text-slate-400 transition hover:bg-slate-800 hover:text-white"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
