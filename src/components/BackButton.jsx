import { ArrowLeft } from "lucide-react";

export default function BackButton({ onBack }) {
  return (
    <button
      className="mb-6 inline-flex min-h-10 items-center gap-2 rounded border border-slate-700 px-4 text-sm font-black text-slate-200 transition hover:border-emerald-500 hover:text-white"
      onClick={onBack}
      type="button"
    >
      <ArrowLeft size={18} />
      Back
    </button>
  );
}
