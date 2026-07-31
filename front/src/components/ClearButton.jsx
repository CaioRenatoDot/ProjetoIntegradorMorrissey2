import { X } from "lucide-react";

export default function ClearButton({ label = "Clear", onClear }) {
  return (
    <button
      aria-label={label}
      className="grid h-5 w-5 flex-none place-items-center rounded-full text-[#aaa] transition hover:bg-[#00c030]/15 hover:text-[#00c030] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c030]/70 focus-visible:ring-offset-1 focus-visible:ring-offset-[#2a2a2a]"
      onClick={onClear}
      // Sem isso o botao rouba o foco do input antes do click, disparando o
      // onBlur do campo (que fecha a busca) e cancelando o clique.
      onMouseDown={(event) => event.preventDefault()}
      type="button"
    >
      <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.6} />
    </button>
  );
}
